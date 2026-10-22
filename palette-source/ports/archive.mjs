import { crc32, deflateRawSync } from "node:zlib";

// Small, deterministic ZIP32 packages: UTF-8 paths, deflate, fixed 1980 timestamp.
// No ZIP64, streaming or filesystem traversal: all entries are supplied in memory by the generator.
export function zip(entries) {
  const local = [];
  const central = [];
  let offset = 0;
  for (const { path, content } of entries.toSorted((a, b) =>
    a.path < b.path ? -1 : a.path > b.path ? 1 : 0,
  )) {
    if (
      !path ||
      path.startsWith("/") ||
      path.split("/").includes("..") ||
      path.includes("\\")
    ) {
      throw Error(`Unsafe archive path: ${path}`);
    }
    const name = Buffer.from(path);
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content);
    const packed = deflateRawSync(data, { level: 9 });
    const checksum = crc32(data);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x0800, 6);
    header.writeUInt16LE(8, 8);
    header.writeUInt16LE(0x0021, 12);
    header.writeUInt32LE(checksum, 14);
    header.writeUInt32LE(packed.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(name.length, 26);
    local.push(header, name, packed);

    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50, 0);
    record.writeUInt16LE(0x0314, 4);
    header.copy(record, 6, 4, 28);
    record.writeUInt32LE(0o100644 * 65536, 38);
    record.writeUInt32LE(offset, 42);
    central.push(record, name);
    offset += header.length + name.length + packed.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}
