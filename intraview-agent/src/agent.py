
# src/agent.py

import asyncio
import logging

from dotenv import load_dotenv
from livekit.agents import AgentServer, JobContext, JobProcess, cli
from livekit.plugins import silero

from runtime import InterviewRuntime
from tavus_avatar import TavusAvatarBridge

logger = logging.getLogger("agent")

load_dotenv(".env.local")

server = AgentServer()


def prewarm(proc: JobProcess):
    # Preload Silero VAD once per worker process.
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="intraview-agent")
async def my_agent(ctx: JobContext):

    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    runtime = None

    try:

        logger.info(
            "Starting interview runtime: room=%s",
            ctx.room.name,
        )

        runtime = InterviewRuntime(ctx)
        runtime.avatar_bridge = TavusAvatarBridge.from_job_metadata(
            ctx.job.metadata
        )

        await runtime.run()

        logger.info(
            "Interview runtime completed cleanly: room=%s",
            ctx.room.name,
        )

    except asyncio.CancelledError:

        logger.warning(
            "Interview runtime cancelled: room=%s",
            ctx.room.name,
        )

        raise

    except Exception:

        logger.exception(
            "Fatal runtime error: room=%s",
            ctx.room.name,
        )

        raise

    finally:

        if runtime is not None:

            try:

                logger.info(
                    "Shutting down runtime: room=%s",
                    ctx.room.name,
                )

                await runtime.shutdown()

            except Exception:

                logger.exception(
                    "Runtime shutdown failed: room=%s",
                    ctx.room.name,
                )


if __name__ == "__main__":
    cli.run_app(server)
