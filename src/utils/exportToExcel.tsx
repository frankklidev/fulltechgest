import ExcelJS from 'exceljs';

interface Product {
  id: number | string;
  name: string;
  description: string;
  price: number | string;
  link: string;
  category_id: number | string;
  subcategory_id: number | string;
  image_url?: string;
  isedited: boolean;
  isdeleted: boolean;
  brand_id?: number | string;
}

// Función para transformar los datos crudos a la estructura esperada
const transformDataToProducts = (data: any[]): Product[] => {
  return data.map(item => ({
    id: parseInt(item.ID || '0', 10) || '', // Convertir 0 a cadena vacía
    name: item.Nombre || '',
    description: item.Descripción || '',
    price: parseFloat(item.Precio || '0') || '', // Convertir 0 a cadena vacía
    link: item.Enlace || '',
    category_id: item.category_id || '', // Convertir 0 a cadena vacía
    subcategory_id: item.subcategory_id || '', // Convertir 0 a cadena vacía
    image_url: item.image_url || '',
    isedited: item.isedited || false,
    isdeleted: item.isdeleted || false,
    brand_id: item.brand_id || '', // Convertir 0 a cadena vacía
  }));
};

// Función para exportar los productos a Excel
export const exportToExcel = async (rawData: any[]) => {
  // Transformar los datos crudos
  const products = transformDataToProducts(rawData);

  // Filtrar los productos eliminados y seleccionar las columnas necesarias
  const filteredProducts = products.filter(product => !product.isdeleted);

  if (filteredProducts.length === 0) {
    console.error('No hay productos válidos para exportar.');
    return;
  }

  // Crear un nuevo libro y hoja de Excel
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Products');

  // Configurar encabezados de las columnas
  worksheet.columns = [
    { header: 'Nombre', key: 'name', width: 40 },
    { header: 'Precio', key: 'price', width: 15 },
  ];

  // Agregar filas y aplicar estilos
  filteredProducts.forEach(product => {
    const isCategory = product.name.startsWith('Categoría:');
    const isSubcategory = product.name.startsWith('Subcategoría:');

    // Agregar un espacio antes de una nueva categoría
    if (isCategory) {
      worksheet.addRow({}); // Fila en blanco

      const separatorRow = worksheet.addRow({ name: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', price: '' });

      // Estilo para las cruces largas
      separatorRow.getCell('name').font = {
        color: { argb: 'FF0000' }, // Rojo
        bold: true,
        size: 10,
      };
      separatorRow.getCell('name').alignment = { horizontal: 'left' }; // Alinear a la izquierda

      worksheet.addRow({}); // Otro espacio en blanco después de las cruces largas
    }

    // Agregar un espacio antes de una nueva subcategoría
    if (isSubcategory) {
      worksheet.addRow({}); // Fila en blanco
    }

    // Agregar la fila del producto
    const row = worksheet.addRow({
      name: product.name,
      price: product.price || '',
    });

    // Aplicar estilos para categorías y subcategorías
    if (isCategory) {
      row.getCell('name').font = { bold: true, size: 14 };
    } else if (isSubcategory) {
      row.getCell('name').font = { bold: true, size: 12 };
    }

    // Agregar un espacio después de una subcategoría
    if (isSubcategory) {
      worksheet.addRow({}); // Fila en blanco
    }
  });

  // Guardar el archivo Excel
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'products.xlsx';
  link.click();
};

// Función para copiar los enlaces de productos al portapapeles
export const copyLinksToClipboard = (rawData) => {
  console.log("Datos recibidos en copyLinksToClipboard:", rawData);

  // Filtrar productos no eliminados
  const links = rawData
    .filter(product => !product.isdeleted) // Solo no eliminados
    .map(product => product.link?.trim()) // Asegurarse de que el link sea válido
    .filter(link => link); // Eliminar enlaces nulos o vacíos

  console.log("Enlaces válidos para copiar:", links);

  if (links.length === 0) {
    console.error("No hay enlaces válidos para copiar al portapapeles.");
    return;
  }

  const textContent = links.join("\n\n");

  // Copiar al portapapeles
  navigator.clipboard.writeText(textContent).then(
    () => console.log("Enlaces copiados al portapapeles."),
    (err) => console.error("Error al copiar al portapapeles:", err)
  );
};




