/** Scene builders that keep hand-authored questions compact. */

import type {
  CardIcon, ChannelLayout, LightsViewLayout, OpenWaterLayout, Scene,
  Swimmer, Vessel, ViewedLight, WaterFeature,
} from '../../scene/model.ts';

interface OpenWaterOptions {
  width?: number;
  height?: number;
  night?: boolean;
  animate?: boolean;
  shores?: OpenWaterLayout['shores'];
  features?: WaterFeature[];
  swimmers?: Swimmer[];
}

export function openWaterScene(
  id: string,
  title: string,
  vessels: Vessel[],
  options: OpenWaterOptions = {},
): Scene {
  return {
    id,
    title,
    night: options.night,
    animate: options.animate,
    layout: {
      kind: 'openWater',
      width: options.width ?? 130,
      height: options.height ?? 110,
      shores: options.shores,
      features: options.features,
    },
    vessels,
    swimmers: options.swimmers,
  };
}

interface ChannelOptions {
  length?: number;
  channelWidth?: number;
  upstream?: ChannelLayout['upstream'];
  banks?: ChannelLayout['banks'];
  night?: boolean;
  animate?: boolean;
  features?: WaterFeature[];
  /** Adds paired lateral marks along the channel edges (upstream north). */
  standardMarks?: boolean;
}

export function channelScene(
  id: string,
  title: string,
  vessels: Vessel[],
  options: ChannelOptions = {},
): Scene {
  const length = options.length ?? 150;
  const channelWidth = options.channelWidth ?? 40;
  const features: WaterFeature[] = [...(options.features ?? [])];
  if (options.standardMarks !== false) {
    const edge = channelWidth / 2;
    for (const [index, y] of [-length / 2 + 22, 0, length / 2 - 22].entries()) {
      features.push(
        { kind: 'mark', id: `port-${index}`, markType: 'lateralPort', x: -edge, y },
        { kind: 'mark', id: `starboard-${index}`, markType: 'lateralStarboard', x: edge, y },
      );
    }
  }
  return {
    id,
    title,
    night: options.night,
    animate: options.animate,
    layout: {
      kind: 'channel',
      length,
      channelWidth,
      upstream: options.upstream ?? 'north',
      banks: options.banks,
      features,
    },
    vessels,
  };
}

export function lightsScene(
  id: string,
  title: string,
  lights: ViewedLight[],
  silhouette: LightsViewLayout['silhouette'] = 'none',
): Scene {
  return {
    id,
    title,
    layout: { kind: 'lightsView', lights, silhouette },
    vessels: [],
  };
}

export function cardScene(
  id: string,
  title: string,
  icon: CardIcon,
  label?: string,
  badge?: string,
): Scene {
  return {
    id,
    title,
    layout: { kind: 'card', icon, label, badge },
    vessels: [],
  };
}
