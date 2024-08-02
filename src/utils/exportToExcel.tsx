import * as XLSX from 'xlsx';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  link: string;
  category_id: number;
  subcategory_id: number;
  image_url?: string;
  isedited: boolean;
  isdeleted: boolean;
  brand_id?: number;
}

export const exportToExcel = (products: Product[]) => {
  // Filtra los productos eliminados y solo selecciona nombre y precio
  const filteredProducts = products
    .filter(product => !product.isdeleted)
    .map(({ name, price }) => ({ name, price }));
  
  const worksheet = XLSX.utils.json_to_sheet(filteredProducts);

  // Configuración del ancho de las columnas
  const columnWidths = [
    { wch: 50 }, // Ancho para la columna de nombre
    { wch: 15 }  // Ancho para la columna de precio
  ];
  worksheet['!cols'] = columnWidths;
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  XLSX.writeFile(workbook, 'products.xlsx');
};

export const copyLinksToClipboard = (products: Product[]) => {
  // Extrae los enlaces de los productos
  const links = products.map(product => product.link).filter(link => link);

  // Une los enlaces en una sola cadena, separada por dos saltos de línea
  const textContent = links.join('\n\n');

  // Copia el contenido al portapapeles
  navigator.clipboard.writeText(textContent).then(
    () => {
      console.log('Enlaces copiados al portapapeles');
    },
    (err) => {
      console.error('Error al copiar al portapapeles: ', err);
    }
  );
};
