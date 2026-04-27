import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET = 'products';
const FOLDER = 'public';
const DRY_RUN = true;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const getPathFromUrl = (url) => {
  if (!url) return null;

  const cleanUrl = url.split('?')[0];
  const marker = `/object/public/${BUCKET}/`;

  if (!cleanUrl.includes(marker)) return null;

  return cleanUrl.split(marker)[1];
};

async function listAllFiles() {
  const allFiles = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) throw error;

    const files = data || [];

    allFiles.push(...files.map((file) => `${FOLDER}/${file.name}`));

    if (files.length < limit) break;

    offset += limit;
  }

  return allFiles;
}

async function main() {
  console.log('Leyendo archivos del bucket con Storage API...');

  const allPaths = await listAllFiles();

  console.log('Leyendo productos con imagen...');

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, image_url')
    .not('image_url', 'is', null)
    .neq('image_url', '');

  if (productsError) {
    throw productsError;
  }

  const usedPaths = new Set();

  for (const product of products || []) {
    const path = getPathFromUrl(product.image_url);

    if (path) {
      usedPaths.add(path);
    }
  }

  const unusedPaths = allPaths.filter((path) => !usedPaths.has(path));

  console.log('--------------------------------');
  console.log(`Total archivos en bucket: ${allPaths.length}`);
  console.log(`Productos con image_url: ${products.length}`);
  console.log(`Archivos usados reales: ${usedPaths.size}`);
  console.log(`Archivos no usados: ${unusedPaths.length}`);
  console.log('--------------------------------');

  if (unusedPaths.length > 0) {
    console.log('Primeros 30 archivos que se borrarían:');
    console.log(unusedPaths.slice(0, 30));
  }

  if (DRY_RUN) {
    console.log('DRY_RUN activo. No se borró nada.');
    console.log('Cuando confirmes que los números cuadran, cambia DRY_RUN a false.');
    return;
  }

  const batchSize = 100;

  for (let i = 0; i < unusedPaths.length; i += batchSize) {
    const batch = unusedPaths.slice(i, i + batchSize);

    const { error } = await supabase.storage.from(BUCKET).remove(batch);

    if (error) {
      console.error(`Error borrando batch ${i / batchSize + 1}:`, error);
    } else {
      console.log(`Borrados ${Math.min(i + batch.length, unusedPaths.length)} / ${unusedPaths.length}`);
    }
  }

  console.log('Proceso terminado.');
}

main().catch((error) => {
  console.error('Error ejecutando script:', error);
  process.exit(1);
});