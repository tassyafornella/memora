(function () {

  "use strict";


  async function loadCatalogCovers() {

    const db =
      window.memoraSupabase;


    if (!db) {

      console.warn(
        "Memora Gallery: Supabase belum tersedia."
      );

      return;

    }


    try {

      const {
        data,
        error
      } =
        await db
          .from("product_gallery")
          .select(`
            id,
            product_id,
            image_url,
            is_cover,
            is_active,
            products (
              id,
              slug,
              name
            )
          `)
          .eq(
            "is_cover",
            true
          )
          .eq(
            "is_active",
            true
          );


      if (error) {
        throw error;
      }


      if (!Array.isArray(data)) {
        return;
      }


      data.forEach(
        item => {

          const slug =
            item.products?.slug;


          const imageUrl =
            item.image_url;


          if (
            !slug ||
            !imageUrl
          ) {

            return;

          }


          const image =
            document.querySelector(
              `[data-product-cover="${slug}"]`
            );


          if (!image) {
            return;
          }


          image.src =
            imageUrl;


          image.removeAttribute(
            "onerror"
          );

        }
      );

    }
    catch (error) {

      console.error(
        "Memora customer gallery:",
        error
      );

    }

  }


  document.addEventListener(
    "DOMContentLoaded",
    loadCatalogCovers
  );


})();
