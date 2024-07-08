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
}

export const exportToExcel = (products: Product[]) => {
  // Prepara los datos y las cabeceras
  const data = [
    ['Nombre', 'Descripción', 'Precio', 'Enlace'],
    ...products.map(product => [
      product.name,
      product.description,
      product.price,
      product.link,
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

  // Ajusta el ancho de las columnas
  const wscols = [
    { wch: 20 }, // Ancho de la columna Nombre
    { wch: 40 }, // Ancho de la columna Descripción
    { wch: 10 }, // Ancho de la columna Precio
    { wch: 30 }, // Ancho de la columna Enlace
  ];
  worksheet['!cols'] = wscols;

  // Ajusta la altura de las filas
  const wsrows = new Array(data.length).fill({ hpx: 24 }); // Altura de todas las filas
  worksheet['!rows'] = wsrows;

  // Aplica estilos
  const range = XLSX.utils.decode_range(worksheet['!ref'] || '');
  for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
    const product = products[rowNum - 1];
    if (!product.link) {
      for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
        if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: 's', v: '' };
        worksheet[cellAddress].s = {
          fill: { fgColor: { rgb: 'FFFF00' } }, // Fondo amarillo
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
          alignment: { vertical: 'center', horizontal: 'center' },
        };
      }
    }
  }

  // Genera el archivo Excel
  XLSX.writeFile(workbook, 'productos.xlsx');
};
