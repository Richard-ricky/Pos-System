/**
 * productSearch.ts
 *
 * Two search strategies for the POS product list:
 *   1. bruteForceSearch  — simple O(n·k) linear scan, always correct, no setup cost.
 *   2. TernarySearchTree — O(k·log n) average insert/search on sorted data.
 *                          Stores product *indices* at leaf nodes so the original
 *                          Product[] array never needs to be duplicated.
 *
 * Usage
 * ─────
 *   const tst = new TernarySearchTree<Product>();
 *   products.forEach(p => {
 *     tst.insert(p.name.toLowerCase(), p);
 *     if (p.barcode) tst.insert(p.barcode, p);
 *   });
 *
 *   // prefix search (returns every product whose name/barcode starts with "coc")
 *   const results = tst.search("coc");
 *
 *   // brute-force fallback (substring match, category filter)
 *   const results2 = bruteForceSearch(products, "coc", "Beverages");
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Searchable {
  name: string;
  barcode?: string;
  category: string;
}

// ─── 1. Brute Force Search ────────────────────────────────────────────────────

/**
 * Scans every product linearly.
 * Matches if the query is a substring of name OR equals the barcode.
 * O(n · k) where n = number of products, k = query length.
 */
export function bruteForceSearch<T extends Searchable>(
  products: T[],
  query: string,
  category = 'All',
): T[] {
  const q = query.trim().toLowerCase();
  return products.filter(p => {
    const matchesCategory = category === 'All' || p.category === category;
    if (!matchesCategory) return false;
    if (q === '') return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.barcode != null && p.barcode.includes(q))
    );
  });
}

// ─── 2. Ternary Search Tree ───────────────────────────────────────────────────

interface TSTNode<T> {
  char: string;
  left:  TSTNode<T> | null;
  mid:   TSTNode<T> | null;
  right: TSTNode<T> | null;
  /** Non-null when this node marks the end of an inserted key. */
  values: T[];
}

function makeNode<T>(char: string): TSTNode<T> {
  return { char, left: null, mid: null, right: null, values: [] };
}

export class TernarySearchTree<T extends Searchable> {
  private root: TSTNode<T> | null = null;
  private _size = 0;

  get size() { return this._size; }

  // ── Insert ────────────────────────────────────────────────────────────────

  insert(key: string, value: T): void {
    if (!key) return;
    this.root = this._insert(this.root, key.toLowerCase(), 0, value);
    this._size++;
  }

  private _insert(
    node: TSTNode<T> | null,
    key: string,
    depth: number,
    value: T,
  ): TSTNode<T> {
    const ch = key[depth];

    if (node === null) node = makeNode<T>(ch);

    if (ch < node.char) {
      node.left  = this._insert(node.left,  key, depth, value);
    } else if (ch > node.char) {
      node.right = this._insert(node.right, key, depth, value);
    } else if (depth < key.length - 1) {
      node.mid   = this._insert(node.mid,   key, depth + 1, value);
    } else {
      // End of key — store the value (allow duplicates from different fields)
      node.values.push(value);
    }
    return node;
  }

  // ── Exact lookup ──────────────────────────────────────────────────────────

  get(key: string): T[] {
    const node = this._get(this.root, key.toLowerCase(), 0);
    return node ? node.values : [];
  }

  private _get(
    node: TSTNode<T> | null,
    key: string,
    depth: number,
  ): TSTNode<T> | null {
    if (!node) return null;
    const ch = key[depth];
    if      (ch < node.char) return this._get(node.left,  key, depth);
    else if (ch > node.char) return this._get(node.right, key, depth);
    else if (depth < key.length - 1) return this._get(node.mid, key, depth + 1);
    else return node;
  }

  // ── Prefix search ─────────────────────────────────────────────────────────

  /**
   * Returns all values whose stored key starts with `prefix`.
   * Also returns exact matches for the prefix itself.
   * Deduplicates by product name to handle both name & barcode inserts.
   */
  search(prefix: string, category = 'All'): T[] {
    const p = prefix.trim().toLowerCase();
    const results: T[] = [];
    const seen = new Set<string>();

    const collect = (node: TSTNode<T> | null) => {
      if (!node) return;
      collect(node.left);
      if (node.values.length > 0) {
        for (const v of node.values) {
          const key = v.name + '|' + (v.barcode ?? '');
          if (!seen.has(key)) {
            seen.add(key);
            results.push(v);
          }
        }
      }
      collect(node.mid);
      collect(node.right);
    };

    if (p === '') {
      // Empty prefix → return everything
      collect(this.root);
    } else {
      // Navigate to the prefix end-node, then collect the whole subtree
      const prefixEndNode = this._get(this.root, p, 0);
      if (prefixEndNode) {
        // Include exact match at the prefix itself
        for (const v of prefixEndNode.values) {
          const key = v.name + '|' + (v.barcode ?? '');
          if (!seen.has(key)) { seen.add(key); results.push(v); }
        }
        // Collect all keys that continue past this prefix
        collect(prefixEndNode.mid);
      }
    }

    if (category === 'All') return results;
    return results.filter(r => r.category === category);
  }

  // ── Rebuild ───────────────────────────────────────────────────────────────

  /** Clears and reinserts all products. Call after a products reload. */
  rebuild(products: T[]): void {
    this.root   = null;
    this._size  = 0;
    for (const p of products) {
      this.insert(p.name, p);
      if (p.barcode) this.insert(p.barcode, p);
    }
  }
}