export type QS = 'info' | 'warn';

export type PER = {
  qss: QS[];
  atpid: number;
};

export type ER = {
  rid: number;
  atqg?: number[];
  per?: PER;
};

export type ERS = {
  pid: number;
  ers: ER[];
};

export type DB = {
  seq: number;
  docs: ERS[];
};
