import { useState } from 'react';
import { Search, Plus, Star, ShoppingCart, TrendingDown } from 'lucide-react';
import { AppPageHeader } from '@/shared/components/AppPageHeader';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatDateShort } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';

const MOCK_PRODUCTS = [
  {
    id: '1', name: 'Huile de table', category: 'Cooking', unit: 'L',
    isFavorite: true, latestPrice: 28.5, cheapestRecentPrice: 25.9,
    latestStore: 'Marjane', lastUpdated: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '2', name: 'Tomates', category: 'Produce', unit: 'kg',
    isFavorite: true, latestPrice: 4.5, cheapestRecentPrice: 3.8,
    latestStore: 'Souk', lastUpdated: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3', name: 'Pain (baguette)', category: 'Bakery', unit: 'piece',
    isFavorite: false, latestPrice: 1.5, cheapestRecentPrice: 1.2,
    latestStore: 'Boulangerie', lastUpdated: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: '4', name: 'Lait', category: 'Dairy', unit: 'L',
    isFavorite: true, latestPrice: 7.5, cheapestRecentPrice: 7.0,
    latestStore: 'Carrefour', lastUpdated: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: '5', name: 'Poulet entier', category: 'Meat', unit: 'kg',
    isFavorite: false, latestPrice: 32.0, cheapestRecentPrice: 28.0,
    latestStore: 'Boucherie Centrale', lastUpdated: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export default function GroceryPricesPage() {
  const [search, setSearch] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFav = !showFavorites || p.isFavorite;
    return matchSearch && matchFav;
  });

  return (
    <div>
      <AppPageHeader
        title="Grocery Prices"
        subtitle="Track and compare prices across stores"
        action={
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            Add price
          </Button>
        }
      />

      {/* Filter bar */}
      <Card className="mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              showFavorites
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            <Star className="w-4 h-4" />
            Favorites
          </button>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShoppingCart}
            title="No products found"
            description="Start tracking grocery prices to compare stores over time."
            action={{ label: 'Add first price', onClick: () => setModalOpen(true) }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => {
            const savingsPct = product.cheapestRecentPrice
              ? Math.round(((product.latestPrice! - product.cheapestRecentPrice) / product.latestPrice!) * 100)
              : 0;

            return (
              <Card key={product.id} className="hover:shadow-card-hover transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default" size="sm">{product.category}</Badge>
                      <span className="text-xs text-slate-400">per {product.unit}</span>
                    </div>
                  </div>
                  <button className={cn('p-1 rounded-md transition-colors', product.isFavorite ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400')}>
                    <Star className="w-4 h-4" fill={product.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Latest price</span>
                    <span className="text-lg font-bold text-slate-800">
                      MAD {product.latestPrice?.toFixed(2)}
                    </span>
                  </div>

                  {product.cheapestRecentPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Best recent</span>
                      <div className="flex items-center gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          MAD {product.cheapestRecentPrice.toFixed(2)}
                        </span>
                        {savingsPct > 0 && (
                          <Badge variant="success" size="sm">{savingsPct}% cheaper</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {product.latestStore} · {formatDateShort(product.lastUpdated!)}
                  </span>
                  <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                    History →
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Price Modal — placeholder, wire to modal component */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-semibold text-slate-800 mb-4">Add Price Entry</h2>
            <p className="text-sm text-slate-500 mb-4">Form coming soon — will integrate with grocery prices API.</p>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
