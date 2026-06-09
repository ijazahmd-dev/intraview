# intraview_agent/runtime_guard.py

import asyncio
import logging
from typing import Optional

from backend_client import BackendClient, BackendOwnershipConflict
from constants import (
    MAX_HEARTBEAT_FAILURES,
)


logger = logging.getLogger(__name__)


class RuntimeOwnershipLost(Exception):
    """
    Raised when this runtime is no longer the authoritative owner
    of the interview session.
    """
    pass


class RuntimeGuard:
    """
    Handles:
    - runtime ownership acquisition
    - ownership validation
    - heartbeat renewal
    - stale runtime fencing
    - graceful ownership release

    This keeps runtime lifecycle concerns OUT of runtime.py.
    """

    def __init__(
        self,
        *,
        backend: BackendClient,
        session_id: int,
        heartbeat_interval_seconds: float = 5.0,
    ):
        self.backend = backend
        self.session_id = session_id
        self.heartbeat_interval_seconds = heartbeat_interval_seconds

        self.runtime_id = backend.runtime_id

        self.runtime_generation: int = 0

        self._heartbeat_task: Optional[asyncio.Task] = None
        self._running: bool = False
        self._stopping: bool = False

        self._heartbeat_failures: int = 0

    # ------------------------------------------------------------------
    # Ownership acquisition
    # ------------------------------------------------------------------

    async def acquire_ownership(self):
        """
        Acquire runtime ownership from backend.

        Backend decides whether:
        - ownership is granted
        - stale runtime is replaced
        - runtime is rejected
        """

        logger.info(
            "Attempting runtime ownership acquisition: "
            "session_id=%s runtime_id=%s",
            self.session_id,
            self.runtime_id,
        )

        data = await self.backend.acquire_runtime_ownership(
            self.session_id
        )

        is_owner = bool(data.get("is_owner"))

        if not is_owner:
            raise RuntimeOwnershipLost(
                f"Runtime ownership denied for session "
                f"{self.session_id}"
            )

        self.runtime_generation = int(
            data.get("runtime_generation", 0)
        )

        logger.info(
            "Runtime ownership acquired: "
            "session_id=%s runtime_id=%s generation=%s",
            self.session_id,
            self.runtime_id,
            self.runtime_generation,
        )

    # ------------------------------------------------------------------
    # Ownership validation
    # ------------------------------------------------------------------

    async def ensure_runtime_valid(self):
        """
        Verify that THIS runtime still owns the interview session.

        If ownership has been lost:
        - immediately stop runtime
        - prevent duplicate interviewers
        """

        is_owner = await self.backend.validate_runtime_ownership(
            self.session_id
        )

        if not is_owner:
            logger.error(
                "Runtime ownership lost: "
                "session_id=%s runtime_id=%s",
                self.session_id,
                self.runtime_id,
            )

            raise RuntimeOwnershipLost(
                f"Runtime ownership lost for "
                f"session {self.session_id}"
            )




    def runtime_snapshot(self) -> dict:
        """
        RuntimeGuard observability snapshot.

        Useful for:
        - structured logging
        - debugging
        - admin diagnostics
        - runtime health monitoring
        """

        return {
            "session_id": self.session_id,
            "runtime_id": self.runtime_id,
            "runtime_generation": self.runtime_generation,
            "running": self._running,
            "stopping": self._stopping,
            "heartbeat_failures": self._heartbeat_failures,
            "heartbeat_task_alive": (
                self._heartbeat_task is not None
                and not self._heartbeat_task.done()
            ),
        }    

    # ------------------------------------------------------------------
    # Heartbeat loop
    # ------------------------------------------------------------------

    async def _heartbeat_loop(self):
        """
        Continuously renew runtime lease.

        Prevents backend from considering this runtime stale.
        """

        logger.info(
            "Starting runtime heartbeat loop: "
            "session_id=%s runtime_id=%s",
            self.session_id,
            self.runtime_id,
        )

        try:
            while self._running:

                try:
                    await self.backend.heartbeat_runtime(
                        self.session_id
                    )

                    await self.ensure_runtime_valid()

                    # Heartbeat succeeded.
                    # Reset consecutive failure counter.
                    self._heartbeat_failures = 0

                except RuntimeOwnershipLost:

                    logger.error(
                        "Runtime ownership lost during heartbeat loop: "
                        "session_id=%s runtime_id=%s",
                        self.session_id,
                        self.runtime_id,
                    )

                    raise

                except BackendOwnershipConflict as exc:
                    logger.warning(
                        "Runtime ownership conflict during heartbeat: session_id=%s runtime_id=%s detail=%s",
                        self.session_id,
                        self.runtime_id,
                        exc,
                    )
                    raise RuntimeOwnershipLost(
                        f"Runtime ownership lost for session {self.session_id}"
                    ) from exc

                except Exception:

                    self._heartbeat_failures += 1

                    logger.exception(
                        "Runtime heartbeat failed: "
                        "session_id=%s runtime_id=%s "
                        "failure_count=%s",
                        self.session_id,
                        self.runtime_id,
                        self._heartbeat_failures,
                    )

                    # Prevent zombie runtimes surviving forever.
                    if (
                        self._heartbeat_failures
                        >= MAX_HEARTBEAT_FAILURES
                    ):
                        raise RuntimeOwnershipLost(
                            "Too many heartbeat failures."
                        )

                await asyncio.sleep(
                    self.heartbeat_interval_seconds
                )

        except asyncio.CancelledError:
            logger.info(
                "Heartbeat loop cancelled: "
                "session_id=%s runtime_id=%s",
                self.session_id,
                self.runtime_id,
            )
            raise

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def start(self):
        """
        Start runtime ownership lifecycle.

        Order:
        1. acquire ownership
        2. start heartbeat loop
        """

        if self._running:
            logger.warning(
                "RuntimeGuard.start() called while already running: "
                "session_id=%s runtime_id=%s",
                self.session_id,
                self.runtime_id,
            )
            return

        if self._heartbeat_task and not self._heartbeat_task.done():
            logger.warning(
                "Heartbeat task already exists before start(): "
                "session_id=%s runtime_id=%s",
                self.session_id,
                self.runtime_id,
            )
            return

        await self.acquire_ownership()

        self._running = True

        self._heartbeat_task = asyncio.create_task(
            self._heartbeat_loop(),
            name=(
                f"runtime-heartbeat-"
                f"{self.session_id}-"
                f"{self.runtime_id}"
            ),
        )

    async def stop(self):
        """
        Gracefully stop runtime ownership lifecycle.
        """

        if self._stopping:
            return

        self._stopping = True
        self._running = False

        if self._heartbeat_task:
            self._heartbeat_task.cancel()

            try:
                await self._heartbeat_task
            except asyncio.CancelledError:
                pass
            except RuntimeOwnershipLost:
                logger.info(
                    "Heartbeat loop had already lost ownership during shutdown: session_id=%s runtime_id=%s",
                    self.session_id,
                    self.runtime_id,
                )

        try:
            await self.backend.release_runtime_ownership(
                self.session_id
            )
        except Exception:
            logger.exception(
                "Failed to release runtime ownership: "
                "session_id=%s runtime_id=%s",
                self.session_id,
                self.runtime_id,
            )

        logger.info(
            "Runtime guard stopped: "
            "session_id=%s runtime_id=%s",
            self.session_id,
            self.runtime_id,
        )

        self._heartbeat_task = None
        self._stopping = False
