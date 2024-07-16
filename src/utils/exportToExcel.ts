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

export const exportLinksToTxt = (products: Product[]) => {
  // Extrae los enlaces de los productos
  const links = products.map(product => product.link).filter(link => link);

  // Une los enlaces en una sola cadena, separada por dos saltos de línea
  const textContent = links.join('\n\n');

  // Crea un blob con el contenido de texto
  const blob = new Blob([textContent], { type: 'text/plain' });

  // Crea un enlace para descargar el archivo
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'productos_links.txt';

  // Simula un clic en el enlace para descargar el archivo
  link.click();
};
