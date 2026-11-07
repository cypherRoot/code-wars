import shopMain from './shop.sql?raw';
import shopEdge from './shop-edge.sql?raw';

export interface TableDoc {
  name: string;
  description: string;
  columns: { name: string; type: string; note?: string }[];
}

export interface Dataset {
  id: string;
  title: string;
  description: string;
  /** variant name → seed SQL. `main` is shown to the learner; others are hidden edge-case fixtures. */
  variants: Record<string, string>;
  tables: TableDoc[];
}

export const DATASETS = {
  shop: {
    id: 'shop',
    title: 'shop',
    description: 'A small online store: who bought what, when. An OLTP (transactional) database.',
    variants: { main: shopMain, edge: shopEdge },
    tables: [
      {
        name: 'customers',
        description: 'One row per customer.',
        columns: [
          { name: 'customer_id', type: 'INTEGER', note: 'primary key' },
          { name: 'name', type: 'VARCHAR' },
          { name: 'email', type: 'VARCHAR', note: 'may be NULL' },
          { name: 'country', type: 'VARCHAR' },
          { name: 'city', type: 'VARCHAR', note: 'may be NULL' },
          { name: 'signup_date', type: 'DATE' },
          { name: 'is_active', type: 'BOOLEAN' },
        ],
      },
      {
        name: 'products',
        description: 'One row per product in the catalogue.',
        columns: [
          { name: 'product_id', type: 'INTEGER', note: 'primary key' },
          { name: 'name', type: 'VARCHAR' },
          { name: 'category', type: 'VARCHAR' },
          { name: 'price', type: 'DECIMAL(10,2)' },
        ],
      },
      {
        name: 'orders',
        description: 'One row per order (the order total is in amount).',
        columns: [
          { name: 'order_id', type: 'INTEGER', note: 'primary key' },
          { name: 'customer_id', type: 'INTEGER', note: '→ customers' },
          { name: 'order_date', type: 'DATE' },
          { name: 'status', type: 'VARCHAR', note: 'delivered · shipped · pending · cancelled' },
          { name: 'amount', type: 'DECIMAL(10,2)' },
        ],
      },
    ],
  },
} satisfies Record<string, Dataset>;

export type DatasetId = keyof typeof DATASETS;

export const isDatasetId = (id: string): id is DatasetId => id in DATASETS;

/** Schema name for a dataset variant: `shop`, `shop__edge`. */
export const schemaName = (dataset: DatasetId, variant: string) => (variant === 'main' ? dataset : `${dataset}__${variant}`);
