"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { readDiscoveries, writeDiscoveries } from "@/lib/archive/discovery-store";
import { mergeDiscoveries } from "@/lib/archive/unlock-rules";
import { resolveFieldPlayer } from "@/lib/field/config";
import { makeInit, mergeGameDiscovery, parseGameMessage } from "@/lib/field/contract";
import type { PlayerDiscoveryRecord } from "@/types/archive";
import type { FieldConfig } from "@/types/field";

const subscribe = () => () => {};
const browserOrigin = () => window.location.origin;
const serverOrigin = () => "";
export const FIELD_READY_TIMEOUT_MS = 15_000;

export function FieldContainer({ config }: { config: FieldConfig }) {
  const origin = useSyncExternalStore(subscribe, browserOrigin, serverOrigin);
  const player = origin ? resolveFieldPlayer(config, origin) : null;
  return <main className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8">
    <p className="text-xs tracking-widest text-cinnabar">FIELD / 001</p>
    <h1 className="mt-4 font-serif text-3xl sm:text-5xl">李静训墓 · 现场</h1>
    <p className="mt-4 text-sm leading-7 text-muted">现场负责发现，档案负责理解。已保存的调查记录会在返回档案后继续保留。</p>
    {config.mode === "disabled" ? <div className="my-8 border border-ink/20 p-8"><h2 className="font-serif text-2xl">现场版本准备中</h2><p className="mt-3 text-muted">当前尚未开放现场体验，可以继续阅读调查档案。</p><Link href="/archive/li-jingxun" className="mt-6 inline-block text-cinnabar underline">返回调查档案</Link></div>
      : !origin ? <p role="status" className="my-8">正在准备现场容器…</p>
      : player ? <PlayerSession key={player.url} player={player} mock={config.mode === "mock"} />
      : <div className="my-8"><p role="alert">现场地址未配置或未获准加载。</p><Link href="/archive/li-jingxun" className="mt-5 inline-block text-cinnabar underline">返回调查档案</Link></div>}
  </main>;
}

function PlayerSession({ player, mock }: { player: { url: string; origin: string }; mock: boolean }) {
  const router = useRouter();
  const frame = useRef<HTMLIFrameElement>(null);
  const records = useRef<PlayerDiscoveryRecord[]>([]);
  const ready = useRef(false);
  const initialized = useRef(false);
  const loadCount = useRef(0);
  const readyDocument = useRef<Document | null>(null);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("正在加载现场，等待 READY…");
  const [error, setError] = useState("");
  const stopTimer = useCallback(() => { if (timer.current) clearTimeout(timer.current); }, []);

  const persist = useCallback(() => {
    try {
      // Re-read before merging so a newer Archive/tab update is not downgraded.
      records.current = mergeDiscoveries(readDiscoveries(localStorage, false), records.current);
      writeDiscoveries(localStorage, records.current, false);
      dirty.current = false;
      setError("");
      return true;
    } catch {
      setError("本次记录未能保存，请保持此页打开并重试保存；此前已写入的记录不会被清空。");
      return false;
    }
  }, []);
  const exit = useCallback(() => {
    if (!initialized.current || persist()) router.push("/archive/li-jingxun");
  }, [persist, router]);
  const failPlayer = useCallback((message: string) => {
    ready.current = false;
    stopTimer();
    setError(message);
    setStatus("现场连接已中断；已保存的记录仍在档案中。");
  }, [stopTimer]);

  useEffect(() => {
    ready.current = false;
    timer.current = setTimeout(() => failPlayer("现场加载超时或未发送 READY。可以重试加载，或返回档案。"), FIELD_READY_TIMEOUT_MS);
    function receive(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow || event.origin !== player.origin) return;
      const message = parseGameMessage(event.data);
      if (!message) return;
      if (message.type === "HISTORY_GAME_READY") {
        try {
          records.current = mergeDiscoveries(readDiscoveries(localStorage, false), records.current);
          frame.current?.contentWindow?.postMessage(makeInit(records.current), player.origin);
          initialized.current = true;
          readyDocument.current = frame.current?.contentDocument ?? null;
          ready.current = true;
          stopTimer();
          setStatus("现场已连接，已有调查记录已同步。");
          if (!dirty.current) setError("");
        } catch {
          ready.current = false;
          stopTimer();
          setError("本地记录无法读取，未初始化现场。请检查浏览器存储后重试；原有数据未改动。");
        }
      } else if (ready.current && message.type === "HISTORY_DISCOVERY") {
        try {
          records.current = mergeGameDiscovery(records.current, message);
          dirty.current = true;
          if (persist()) setStatus("调查记录已更新");
        } catch { setError("发现记录数量超过上限，未修改已保存记录。"); }
      } else if (ready.current && message.type === "HISTORY_GAME_EXIT") exit();
    }
    function malformed(event: MessageEvent) {
      if (event.source === frame.current?.contentWindow && event.origin === player.origin) failPlayer("现场消息无法读取，请重试连接。");
    }
    function beforeUnload(event: BeforeUnloadEvent) {
      if (dirty.current) { event.preventDefault(); event.returnValue = ""; }
    }
    window.addEventListener("message", receive);
    window.addEventListener("messageerror", malformed);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      stopTimer();
      window.removeEventListener("message", receive);
      window.removeEventListener("messageerror", malformed);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [attempt, player.origin, exit, failPlayer, persist, stopTimer]);

  return <section aria-label="现场容器" className="mt-8">
    {mock && <p className="mb-4 border-l-2 border-cinnabar pl-4 text-sm leading-7 text-muted">开发 Mock · 仅验证 Web 通信与记录保存，不是正式游戏。这里的操作会写入本机调查档案。</p>}
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
      <p role="status" aria-live="polite" className="text-sm text-muted">{status}</p>
      <button type="button" onClick={exit} className="min-h-11 border border-ink/25 px-5 text-sm hover:border-cinnabar">保存并返回档案</button>
    </div>
    {error && <div className="mb-4 border border-cinnabar/30 bg-cinnabar/5 p-4"><p role="alert" className="text-sm leading-7 text-cinnabar">{error}</p><button type="button" onClick={() => {
      if (dirty.current && !persist()) return;
      loadCount.current = 0; ready.current = false;
      setError(""); setStatus("正在重新加载现场，等待 READY…"); setAttempt((value) => value + 1);
    }} className="mt-3 min-h-11 border border-ink/25 px-4 text-sm">重试加载</button></div>}
    <iframe key={attempt} ref={frame} src={player.url} title="李静训墓现场 Player" sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer" className="h-[620px] w-full rounded-xl border border-ink/20 bg-paper sm:h-[660px]" onError={() => failPlayer("现场加载失败。请重试或返回档案。")} onLoad={() => {
      if (loadCount.current++ > 0 && ready.current) {
        const document = frame.current?.contentDocument;
        if (document && document !== readyDocument.current) failPlayer("现场页面已重新加载或离开，连接已中断。请重新发送 READY 或重试加载。");
        else if (!document) setStatus("Player 页面已加载；已保存记录保留，可重新发送 READY 同步。");
      }
    }} />
  </section>;
}
