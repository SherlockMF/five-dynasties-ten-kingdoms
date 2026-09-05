import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { Position, Polygon, MultiPolygon } from "geojson";
import type { AtlasRegionFeatureCollection, AtlasSourceRecord } from "@/features/history-map/atlas/atlas-types";

function inRing(ring: Position[], point: Position) {
  let inside = false;
  for (let i=0,j=ring.length-1; i<ring.length; j=i++) {
    const [x,y]=ring[i], [px,py]=ring[j];
    if ((y>point[1]) !== (py>point[1]) && point[0]<(px-x)*(point[1]-y)/(py-y)+x) inside=!inside;
  }
  return inside;
}

function contains(geometry: Polygon | MultiPolygon, point: Position) {
  const polygons=geometry.type==="Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.some(([outer,...holes])=>inRing(outer,point) && !holes.some((hole)=>inRing(hole,point)));
}

export function checkAtlasPublication(year: number, expectedPolities: string[]) {
  const read = <T,>(file: string): T => JSON.parse(readFileSync(resolve(`public/maps/${year}/${file}`),"utf8"));
  describe(`${year} repaired atlas`,()=>{
    const realms=read<AtlasRegionFeatureCollection>("realms.geojson");
    const sources=read<AtlasSourceRecord[]>("sources.json");
    it("publishes the year-end controllers including documented local identities",()=>{
      expect(new Set(realms.features.map((f)=>f.properties.dynastyId))).toEqual(new Set(expectedPolities));
      for(const {properties:p} of realms.features) {
        expect(p.validFromYear).toBe(year);
        expect(p.validToYearExclusive).toBe(year+1);
        expect(p.snapshotId).toBe(`snapshot-${year}`);
        expect(p.sourceRefs.length).toBeGreaterThan(0);
        if(p.accuracyLevel==="approximate") expect(p.disputedNote).toBeTruthy();
      }
    });
    it("retains evidence levels and closes every component and hole, with labels inside",()=>{
      const before=JSON.parse(readFileSync(resolve(`gis/continuous/reference/${year}/realms.geojson`),"utf8")) as AtlasRegionFeatureCollection;
      for(const f of realms.features) {
        const previous=before.features.find((p)=>p.properties.dynastyId===f.properties.dynastyId);
        if(previous) expect(f.properties.accuracyLevel).toBe(previous.properties.accuracyLevel);
        const polygons=f.geometry.type==="Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
        for(const rings of polygons) for(const ring of rings) {
          expect(ring[0]).toEqual(ring.at(-1));
          for(const [x,y] of ring) {expect(x>=72 && x<=136 && y>=18 && y<=55).toBe(true);}
        }
        expect(contains(f.geometry,[f.properties.labelLongitude,f.properties.labelLatitude]),f.properties.id).toBe(true);
      }
    });
    it("binds the actual publication to the full-multipolygon GEOS topology audit",()=>{
      const report=JSON.parse(readFileSync(resolve("gis/continuous/generation-report.json"),"utf8"));
      const audit=report.referenceYears?.[year] ?? report.years[year];
      const bytes=readFileSync(resolve(`public/maps/${year}/realms.geojson`));
      expect(audit.realmsSha256).toBe(createHash("sha256").update(bytes).digest("hex"));
      expect(audit.valid).toBe(true);
      for(const field of ["gapDegrees2","overlapDegrees2","offshoreDegrees2"]) expect(audit[field]).toBeLessThan(1e-7);
      expect(Object.keys(report.fineDifferences[year]).length).toBeGreaterThan(0);
    });
    it("resolves every source and publishes no local path or scan asset",()=>{
      const ids=new Set(sources.map((s)=>s.id));
      for(const f of realms.features) for(const ref of f.properties.sourceRefs) expect(ids.has(ref),ref).toBe(true);
      for(const s of sources) {
        expect(JSON.stringify(s)).not.toMatch(/(?:^|["'\s])[A-Za-z]:[\\/]/);
        if(s.reference.startsWith("local-only:")) expect(s.redistributable).toBe(false);
      }
      expect(readdirSync(resolve(`public/maps/${year}`)).some((p)=>/\.(jpg|png|tif|gpkg|qgz)$/i.test(p))).toBe(false);
    });
  });
}
