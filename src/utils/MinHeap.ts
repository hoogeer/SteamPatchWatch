// src/utils/MinHeap.ts
// Define the type here to avoid import issues
export interface MajorUpdateNote {
  gameAppId?: number;
  gameName: string;
  gameIcon: string;
  gid: string;
  appid: number;
  event_name: string;
  rtime32_start_time: number;
  rtime32_end_time: number;
  event_type: number;
  event_notes: string;
  jsondata: string;
  announcement_body?: {
    gid: string;
    headline: string;
    body: string;
    posttime: number;
    updatetime: number;
    commentcount: number;
    tags: string[];
    voteupcount: number;
    votedowncount: number;
    forum_topic_id: string;
    clanid?: string | number;
  };
}

export class MinHeap {
  heap: MajorUpdateNote[] = [];
  maxSize: number;
  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }
  push(note: MajorUpdateNote) {
    if (this.heap.length < this.maxSize) {
      this.heap.push(note);
      this.bubbleUp(this.heap.length - 1);
    } else if (this.compare(note, this.heap[0]) > 0) {
      this.heap[0] = note;
      this.bubbleDown(0);
    }
  }
  compare(a: MajorUpdateNote, b: MajorUpdateNote) {
    const at = a.announcement_body?.posttime || 0;
    const bt = b.announcement_body?.posttime || 0;
    return at - bt;
  }
  bubbleUp(idx: number) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.compare(this.heap[idx], this.heap[parent]) < 0) {
        [this.heap[idx], this.heap[parent]] = [
          this.heap[parent],
          this.heap[idx],
        ];
        idx = parent;
      } else break;
    }
  }
  bubbleDown(idx: number) {
    const n = this.heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < n && this.compare(this.heap[left], this.heap[smallest]) < 0)
        smallest = left;
      if (right < n && this.compare(this.heap[right], this.heap[smallest]) < 0)
        smallest = right;
      if (smallest !== idx) {
        [this.heap[idx], this.heap[smallest]] = [
          this.heap[smallest],
          this.heap[idx],
        ];
        idx = smallest;
      } else break;
    }
  }
  getSortedDesc(): MajorUpdateNote[] {
    return [...this.heap].sort(
      (a, b) =>
        (b.announcement_body?.posttime || 0) -
        (a.announcement_body?.posttime || 0)
    );
  }
}
