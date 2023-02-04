export type Edge = [string, string];
export type Vertex = string;

export interface AdjacentMatrix {
  [k: Vertex]: Set<Vertex>;
}
