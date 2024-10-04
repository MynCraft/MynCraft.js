import { once } from "events";
import { IndexedData } from "minecraft-data";
import {
  PacketMeta,
  PromiseLike,
  SessionObject,
  States,
} from "minecraft-protocol";
import { NBT } from "prismarine-nbt";

export type ClientEvents = {
  error: (error: Error) => PromiseLike;

  packet: (
    data: any,
    packetMeta: PacketMeta,
    buffer: Buffer,
    fullBuffer: Buffer
  ) => PromiseLike;

  raw: (buffer: Buffer, packetMeta: PacketMeta) => PromiseLike;

  session: (session: SessionObject) => PromiseLike;

  state: (newState: States, oldState: States) => PromiseLike;

  end: (reason: string) => PromiseLike;

  connect: () => PromiseLike;

  string: (data: any, packetMeta: PacketMeta) => PromiseLike;

  playerChat: (data: {
    formattedMessage: string;
    message: string;
    type: string;
    sender: string;
    senderName: string;
    senderTeam: string;
    verified?: boolean;
  }) => PromiseLike;

  systemChat: (data: {
    positionId: number;
    formattedMessage: string;
  }) => PromiseLike;
  playerJoin: () => void;
};
interface PCRegistry extends IndexedData {
  loadDimensionCodec(codec: NBT): void;
  writeDimensionCodec(): NBT;
}

interface BedrockRegistry extends IndexedData {}
export type Registry = PCRegistry & BedrockRegistry;
