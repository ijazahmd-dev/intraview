// zegoChatService.js

/**
 * Zego in-room chat + reactions service.
 *
 * This file ONLY handles:
 *  - sending broadcast messages via ZegoExpressEngine
 *  - receiving broadcast messages and normalizing them
 *
 * It does NOT know about React or your UI.
 *
 * Usage from InterviewRoom:
 *
 *   const chat = initializeChat(zegoCtx, {
 *     userId: tokenData.user_id,
 *     userName: `user_${tokenData.user_id}`,
 *   }, {
 *     onChatMessage: (msg) => { ... },
 *     onReaction: (reaction) => { ... },
 *   });
 *
 *   await chat.sendChat("Hello");
 *   await chat.sendReaction("👍");
 *   chat.destroy();   // on leave/unmount
 */

/**
 * Shape of normalized events we send back to React:
 *
 * ChatMessage = {
 *   id: string;
 *   type: "chat";
 *   text: string;
 *   senderId: string;
 *   senderName: string;
 *   ts: number;         // ms timestamp
 *   raw?: any;          // original Zego message info (optional)
 * }
 *
 * Reaction = {
 *   id: string;
 *   type: "reaction";
 *   emoji: string;
 *   senderId: string;
 *   senderName: string;
 *   ts: number;
 *   raw?: any;
 * }
 */

/**
 * Initialize chat for a joined room.
 *
 * @param {object} ctx - Zego room context returned by joinRoom() (must contain ctx.zg and ctx.roomID)
 * @param {object} user - { userId: string, userName: string } for the local user
 * @param {object} callbacks - {
 *   onChatMessage?: (ChatMessage) => void,
 *   onReaction?: (Reaction) => void,
 * }
 *
 * @returns {object} chat - {
 *   sendChat: (text: string) => Promise<void>,
 *   sendReaction: (emoji: string) => Promise<void>,
 *   destroy: () => void,
 * }
 */
export function initializeChat(ctx, user, callbacks = {}) {
  if (!ctx || !ctx.zg || !ctx.roomID) {
    throw new Error("Chat cannot be initialized: invalid Zego context.");
  }
  if (!user || !user.userId) {
    throw new Error("Chat cannot be initialized: user info is missing.");
  }

  const { zg, roomID } = ctx;
  const { userId, userName } = user;
  const { onChatMessage, onReaction } = callbacks;

  /**
   * Internal helper to normalize a single broadcast message from Zego.
   * Zego's IMRecvBroadcastMessage for Web passes:
   *   (roomID: string, messageList: ZegoBroadcastMessageInfo[]).[web:368]
   *
   * Each ZegoBroadcastMessageInfo has:
   *   - message: string
   *   - messageID: number
   *   - sendTime: number (ms)
   *   - fromUser: { userID, userName }.[web:370]
   */
  const handleIMBroadcast = (roomIDFromSDK, messageList) => {
    if (!Array.isArray(messageList)) return;

    messageList.forEach((info) => {
      const rawMessage = info?.message;
      if (typeof rawMessage !== "string") return;

      let payload;
      try {
        payload = JSON.parse(rawMessage);
      } catch (e) {
        console.warn("Received non-JSON broadcast message, ignoring:", rawMessage);
        return;
      }

      if (!payload || !payload.type) return;

      const base = {
        id:
          typeof info.messageID === "number"
            ? String(info.messageID)
            : `${info.sendTime || Date.now()}-${Math.random().toString(36).slice(2)}`,
        senderId: info.fromUser?.userID || "unknown",
        senderName: info.fromUser?.userName || "Unknown",
        ts: info.sendTime || Date.now(),
        raw: info,
      };

      if (payload.type === "chat" && typeof payload.text === "string") {
        if (onChatMessage) {
          onChatMessage({
            ...base,
            type: "chat",
            text: payload.text,
          });
        }
      } else if (payload.type === "reaction" && typeof payload.emoji === "string") {
        if (onReaction) {
          onReaction({
            ...base,
            type: "reaction",
            emoji: payload.emoji,
          });
        }
      }
    });
  };

  // Register Zego IM event listener for broadcast messages.
  // On Web the event name is "IMRecvBroadcastMessage".[web:368]
  zg.on("IMRecvBroadcastMessage", handleIMBroadcast);

  /**
   * Low-level sender for arbitrary JSON payload.
   */
  async function sendPayload(payload) {
    if (!payload || typeof payload !== "object") return;

    const json = JSON.stringify(payload);

    try {
      // Web SDK exposes sendBroadcastMessage(roomID, message).[web:356][web:204]
      const result = await zg.sendBroadcastMessage(roomID, json);
      // Different SDK versions may return just errorCode or an object.
      const errorCode =
        typeof result === "number" ? result : result?.errorCode ?? 0;

      if (errorCode !== 0) {
        console.error("Zego sendBroadcastMessage failed:", result);
        throw new Error("Failed to send message (Zego error " + errorCode + ").");
      }
    } catch (err) {
      console.error("sendBroadcastMessage threw error:", err);
      throw err;
    }
  }

  /**
   * Public function: send a text chat message to everyone in room.
   *
   * @param {string} text
   */
  async function sendChat(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return;

    const payload = {
      type: "chat",
      text: trimmed,
      senderId: userId,
      senderName: userName,
      ts: Date.now(),
    };

    await sendPayload(payload);
  }

  /**
   * Public function: send an emoji reaction to everyone in room.
   *
   * @param {string} emoji - e.g. "👍", "👏", "😂"
   */
  async function sendReaction(emoji) {
    if (!emoji) return;

    const payload = {
      type: "reaction",
      emoji,
      senderId: userId,
      senderName: userName,
      ts: Date.now(),
    };

    await sendPayload(payload);
  }

  /**
   * Destroy chat listeners. Call this when leaving the room
   * or when InterviewRoom unmounts.
   */
  function destroy() {
    try {
      zg.off("IMRecvBroadcastMessage", handleIMBroadcast);
    } catch (e) {
      console.error("Error removing IMRecvBroadcastMessage handler:", e);
    }
  }

  // Optional: store on ctx for debugging / future reuse
  ctx.chatUser = { userId, userName };
  ctx.chatDestroy = destroy;

  return {
    sendChat,
    sendReaction,
    destroy,
  };
}
