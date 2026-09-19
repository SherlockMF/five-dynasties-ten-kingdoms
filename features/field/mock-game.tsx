"use client";

import { useEffect, useRef, useState } from "react";
import { parseInitMessage } from "@/lib/field/contract";
import type { HistoryGameMessage, HistoryInitMessage } from "@/types/field";

const envelope = { schemaVersion: 1, siteId: "li-jingxun" } as const;
export function MockGame() {
  const [init, setInit] = useState<HistoryInitMessage | null>(null);
  const requested = useRef(false);
  useEffect(() => {
    function receive(event: MessageEvent) {
      if (!requested.current || window.parent === window || event.source !== window.parent || event.origin !== window.location.origin) return;
      const message = parseInitMessage(event.data);
      if (message) setInit(message);
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  function send(message: HistoryGameMessage) {
    if (window.parent !== window) window.parent.postMessage(message, window.location.origin);
  }
  const button = "min-h-11 border border-ink/25 px-4 py-3 text-left text-sm disabled:opacity-40 hover:border-cinnabar";
  return <main className="bg-paper p-5 text-ink sm:p-8">
    <h1 className="font-serif text-2xl">Mock Game · 通信测试</h1>
    <p className="my-4 text-sm text-muted">先发送 READY，收到 INIT 后再记录发现。</p>
    <div className="grid gap-3 sm:grid-cols-2">
      <button className={button} onClick={() => { requested.current = true; send({ ...envelope, type: "HISTORY_GAME_READY" }); }}>READY</button>
      <button className={button} disabled={!init} onClick={() => send({ ...envelope, type: "HISTORY_DISCOVERY", discoveryId: "li-jingxun.epitaph", state: "observed" })}>发现墓志 · observed</button>
      <button className={button} disabled={!init} onClick={() => send({ ...envelope, type: "HISTORY_DISCOVERY", discoveryId: "li-jingxun.epitaph", state: "catalogued" })}>深入记录墓志 · catalogued</button>
      <button className={button} disabled={!init} onClick={() => send({ ...envelope, type: "HISTORY_DISCOVERY", discoveryId: "li-jingxun.gold-necklace", state: "observed" })}>发现项链</button>
      <button className={button} disabled={!init} onClick={() => send({ ...envelope, type: "HISTORY_DISCOVERY", discoveryId: "li-jingxun.green-glass-bottle", state: "observed" })}>发现玻璃瓶</button>
      <button className={button} disabled={!init} onClick={() => send({ ...envelope, type: "HISTORY_GAME_EXIT" })}>EXIT</button>
      <button className={button} onClick={() => window.location.reload()}>模拟 Player 重载</button>
    </div>
    <h2 className="mt-6 font-mono text-sm">收到的 INIT</h2>
    <pre aria-label="INIT 数据" className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap break-all border border-ink/15 p-4 text-xs">{init ? JSON.stringify(init, null, 2) : "等待 INIT"}</pre>
  </main>;
}
