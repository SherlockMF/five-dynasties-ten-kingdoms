"use client";

import Link from "next/link";
import { fiveDynastiesConfig } from "@/data/series/five-dynasties/config";
import type { HistorySeriesConfig, HistoricalMapSnapshot } from "@/types/series";
import { HistoricalMap } from "@/features/history-map/historical-map";
import { Timeline } from "@/features/timeline/timeline";
import type { Dynasty, HistoricalEvent, HistoricalRegion, Person } from "@/types/history";

import { ExploreCta } from "./explore-cta";
import { ReadingPaths } from "./reading-paths";
import { Hero } from "./hero";
import { HistoryIntro } from "./history-intro";
import { KeyEvents } from "./key-events";
import { KeyPeople } from "./key-people";

export function HomePageContent({ dynasties, events, people, regions, snapshots, series = fiveDynastiesConfig, routePrefix = "" }: { dynasties: Dynasty[]; events: HistoricalEvent[]; people: Person[]; regions: HistoricalRegion[]; snapshots?: HistoricalMapSnapshot[]; series?: HistorySeriesConfig; routePrefix?: string }) { return <main className="mx-auto w-full max-w-[1480px] px-4 pb-24 sm:px-8 lg:px-12 lg:pb-10"><Hero series={series} routePrefix={routePrefix} />{series.id === fiveDynastiesConfig.id ? <HistoryIntro /> : <p role="status" className="py-8 text-muted">专题框架预览：事件与人物待核验入库，地图为工程占位示意。</p>}<ReadingPaths events={events} series={series} /><section className="py-20"><div className="mb-8 flex items-end justify-between gap-5"><div><p className="text-[10px] tracking-[0.2em] text-cinnabar uppercase">Atlas preview</p><h2 className="mt-4 font-serif text-3xl sm:text-4xl">这一年，哪些政权同时存在？</h2></div><Link href={`${routePrefix}/map?year=${series.defaultYear}`} className="hidden text-sm text-cinnabar underline underline-offset-8 sm:block">查看大地图</Link></div><HistoricalMap series={series} snapshots={snapshots} regions={regions} dynasties={dynasties} mode="preview" /></section><section className="border-t border-ink/15 py-20"><div className="mb-8"><p className="text-[10px] tracking-[0.2em] text-cinnabar uppercase">Timeline preview</p><h2 className="mt-4 font-serif text-3xl sm:text-4xl">把地图上的变化放回时间</h2></div><Timeline key={series.id} series={series} events={events} mode="preview" /></section><KeyPeople people={people} series={series} routePrefix={routePrefix} />{series.id === fiveDynastiesConfig.id ? <><KeyEvents events={events} series={series} routePrefix={routePrefix} /><ExploreCta routePrefix={routePrefix} defaultYear={series.defaultYear} /></> : <Link href={`${routePrefix}/timeline?year=${series.defaultYear}`} className="text-cinnabar underline">从主线开始</Link>}</main>; }
