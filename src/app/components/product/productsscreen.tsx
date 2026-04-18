import { useState, useEffect, useRef } from 'react';
import {
  Plus, Pencil, Trash2, Search, ImageOff, Loader2,
  Package, X, SlidersHorizontal, Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import * as api from '../../utils/api';
import { saveProductImage } from '../../utils/storage';
import { Product } from '../../types';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Beverages', 'Bakery', 'Groceries', 'Dairy', 'Household', 'Electronics', 'Other'];

const EMPTY_FORM = {
  name: '', price: '', category: 'Groceries', stock: '', barcode: '', image: '',
};

// ─── StockBadge ───────────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return (
    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
      Out of stock
    </span>
  );
  if (stock <= 5) return (
    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">
      {stock} left
    </span>
  );
  return (
    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
      {stock} in stock
    </span>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({ product, onEdit, onDelete }: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="group bg-card border-border overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="relative w-full h-44 bg-surface-3 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="size-7 opacity-25" />
            <span className="text-xs opacity-30">No image</span>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 text-muted-foreground">
            {product.category}
          </span>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-0.5">
          <p className="font-semibold text-sm leading-snug line-clamp-1 text-foreground">
            {product.name}
          </p>
          {product.barcode && (
            <p className="text-xs text-muted-foreground font-mono">{product.barcode}</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-bold text-foreground tabular-nums">
            GHS {product.price.toFixed(2)}
          </p>
          <StockBadge stock={product.stock} />
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          <Button
            size="sm" variant="outline"
            className="flex-1 h-8 text-xs border-border hover:bg-accent"
            onClick={() => onEdit(product)}
          >
            <Pencil className="size-3 mr-1.5" /> Edit
          </Button>
          <Button
            size="icon" variant="ghost"
            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-6">
      <div className="relative">
        <div className="size-24 rounded-3xl bg-surface-3 border border-border flex items-center justify-center">
          <Package className="size-10 text-muted-foreground opacity-30" />
        </div>
        <div className="absolute -top-2 -right-2 size-8 rounded-xl bg-primary flex items-center justify-center shadow-md">
          <Sparkles className="size-4 text-primary-foreground" />
        </div>
      </div>

      <div className="space-y-2 max-w-xs">
        <h3 className="text-base font-semibold text-foreground">No products yet</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Start building your inventory. Add your first product and it will appear here and in your POS instantly.
        </p>
      </div>

      <Button onClick={onAdd} size="lg" className="gap-2 px-6">
        <Plus className="size-4" />
        Add your first product
      </Button>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm pt-2">
        {[
          { icon: '📦', label: 'Track stock levels' },
          { icon: '🏷️', label: 'Set prices & barcodes' },
          { icon: '🛒', label: 'Sell via POS instantly' },
        ].map(({ icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-2 border border-border"
          >
            <span className="text-xl">{icon}</span>
            <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ProductForm dialog ───────────────────────────────────────────────────────

function ProductForm({ open, onOpenChange, editingProduct, onSaved }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        price: String(editingProduct.price),
        category: editingProduct.category,
        stock: String(editingProduct.stock),
        barcode: editingProduct.barcode ?? '',
        image: editingProduct.image ?? '',
      });
      setImagePreview(editingProduct.image ?? '');
    } else {
      setFormData(EMPTY_FORM);
      setImagePreview('');
    }
  }, [open, editingProduct]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2 MB'); return; }
    const dataUrl = await saveProductImage(file);
    setImagePreview(dataUrl);
    setFormData((prev) => ({ ...prev, image: dataUrl }));
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Product name is required'); return; }
    if (!formData.price || isNaN(Number(formData.price))) { toast.error('Enter a valid price'); return; }
    if (!formData.stock || isNaN(Number(formData.stock))) { toast.error('Enter a valid stock quantity'); return; }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: formData.name.trim(),
        price: Number(formData.price),
        category: formData.category,
        stock: Number(formData.stock),
        barcode: formData.barcode.trim() || undefined,
        image: formData.image || undefined,
      };
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        toast.success('Product updated');
      } else {
        await api.createProduct(payload);
        toast.success('Product created');
      }
      onOpenChange(false);
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {editingProduct ? 'Edit Product' : 'New Product'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Image */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Product Image</Label>
            <div
              className="relative w-full h-40 bg-surface-3 border border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-surface-4 transition-all duration-150 overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs font-medium">Change image</p>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground space-y-1.5 pointer-events-none">
                  <div className="size-10 rounded-xl bg-surface-4 flex items-center justify-center mx-auto">
                    <ImageOff className="size-4 opacity-50" />
                  </div>
                  <p className="text-xs font-medium">Click to upload</p>
                  <p className="text-xs opacity-60">PNG, JPG up to 2 MB</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            {imagePreview && (
              <button onClick={removeImage} className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors mx-auto">
                <X className="size-3" /> Remove image
              </button>
            )}
          </div>

          <div className="border-t border-border" />

          <div className="space-y-1.5">
            <Label htmlFor="pf-name">Name <span className="text-destructive">*</span></Label>
            <Input
              id="pf-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Coca-Cola 500ml"
              className="bg-input-background border-border"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-price">Price (GHS) <span className="text-destructive">*</span></Label>
              <Input id="pf-price" type="number" min="0" step="0.01" value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00" className="bg-input-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-stock">Stock <span className="text-destructive">*</span></Label>
              <Input id="pf-stock" type="number" min="0" value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0" className="bg-input-background border-border" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger className="bg-input-background border-border"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pf-barcode">
              Barcode <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input id="pf-barcode" value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              placeholder="e.g. 12345678" className="bg-input-background border-border font-mono text-sm" />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="border-border">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="min-w-24 gap-2">
            {saving ? <><Loader2 className="size-3.5 animate-spin" />Saving…</> : editingProduct ? 'Save Changes' : 'Create Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts();
      // Handle any response shape: raw array, { products }, { data }, { items }
      const list: Product[] =
        Array.isArray(res) ? res
        : Array.isArray(res?.products) ? res.products
        : Array.isArray(res?.data) ? res.data
        : Array.isArray(res?.items) ? res.items
        : [];
      setProducts(list);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...CATEGORIES];

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.name.toLowerCase().includes(q) || p.barcode?.includes(q)) &&
      (selectedCategory === 'All' || p.category === selectedCategory)
    );
  });

  const openAdd = () => { setEditingProduct(null); setShowForm(true); };
  const openEdit = (p: Product) => { setEditingProduct(p); setShowForm(true); };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteProduct(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
      await loadProducts();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const hasProducts = products.length > 0;
  const hasFilters = !!searchQuery || selectedCategory !== 'All';

  return (
    <div className="space-y-6 p-1">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading…'
              : hasProducts ? `${products.length} product${products.length !== 1 ? 's' : ''} in inventory`
              : 'No products yet'}
          </p>
        </div>
        {hasProducts && !loading && (
          <Button onClick={openAdd} className="shrink-0 gap-2">
            <Plus className="size-4" /> Add Product
          </Button>
        )}
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-sm">Loading products…</p>
        </div>

      /* ── True empty (no products in DB) ── */
      ) : !hasProducts ? (
        <EmptyState onAdd={openAdd} />

      /* ── Has products ── */
      ) : (
        <>
          {/* Filters */}
          <div className="space-y-3 p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by name or barcode…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 bg-input-background border-border"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={[
                    'text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150',
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground',
                  ].join(' ')}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* No filter results */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <div className="size-14 rounded-2xl bg-surface-3 flex items-center justify-center">
                <Search className="size-6 opacity-30" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">No matches found</p>
                <p className="text-xs">Try adjusting your search or filters</p>
              </div>
              {hasFilters && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="text-xs text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Showing {filtered.length} of {products.length} products
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={openEdit}
                    onDelete={setDeleteId}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Form dialog ── */}
      <ProductForm
        open={showForm}
        onOpenChange={setShowForm}
        editingProduct={editingProduct}
        onSaved={loadProducts}
      />

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Delete product?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              This cannot be undone. The product will be permanently removed from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-border bg-transparent hover:bg-accent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}