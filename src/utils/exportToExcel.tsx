
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

