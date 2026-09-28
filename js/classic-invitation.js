document.addEventListener("DOMContentLoaded", () => {

  const variants = {

    simple: {

      name:
        "Simple",

      price:
        1500,

      image:
        "../../assets/images/products/classic-invitation/simple.jpg",

      contents: [
        "Classic Folded Invitation",
        "Basic Personalized Design",
        "Standard Layout",
        "1 Design Concept"
      ]

    },


    signature: {

      name:
        "Signature",

      price:
        2000,

      image:
        "../../assets/images/products/classic-invitation/signature.jpg",

      contents: [
        "Classic Folded Invitation",
        "Personalized Wedding Design",
        "Enhanced Decorative Elements",
        "Custom Color Theme",
        "Premium Layout"
      ]

    },


    complete: {

      name:
        "Complete",

      price:
        2500,

      image:
        "../../assets/images/products/classic-invitation/complete.jpg",

      contents: [
        "Classic Folded Invitation",
        "Full Personalized Design",
        "Premium Decorative Elements",
        "Custom Wedding Theme",
        "Detailed Layout",
        "Complete Personalized Styling"
      ]

    }

  };


  let selectedVariant =
    "simple";


  const variantButtons =
    document.querySelectorAll(
      "[data-variant]"
    );


  const productImage =
    document.getElementById(
      "productImage"
    );


  const previewPackageName =
    document.getElementById(
      "previewPackageName"
    );


  const selectedPackageLabel =
    document.getElementById(
      "selectedPackageLabel"
    );


  const packageContentName =
    document.getElementById(
      "packageContentName"
    );


  const packageContentList =
    document.getElementById(
      "packageContentList"
    );


  const quantityInput =
    document.getElementById(
      "quantityInput"
    );


  const decreaseQuantity =
    document.getElementById(
      "decreaseQuantity"
    );


  const increaseQuantity =
    document.getElementById(
      "increaseQuantity"
    );


  const summaryPackage =
    document.getElementById(
      "summaryPackage"
    );


  const summaryUnitPrice =
    document.getElementById(
      "summaryUnitPrice"
    );


  const summaryQuantity =
    document.getElementById(
      "summaryQuantity"
    );


  const summaryTotal =
    document.getElementById(
      "summaryTotal"
    );


  const addToCartButton =
    document.getElementById(
      "addToCartButton"
    );


  const cartToast =
    document.getElementById(
      "cartToast"
    );


  const brideName =
    document.getElementById(
      "brideName"
    );


  const groomName =
    document.getElementById(
      "groomName"
    );


  const eventDate =
    document.getElementById(
      "eventDate"
    );


  const invitationTheme =
    document.getElementById(
      "invitationTheme"
    );


  const invitationSize =
    document.getElementById(
      "invitationSize"
    );


  const foldType =
    document.getElementById(
      "foldType"
    );


  const customerNote =
    document.getElementById(
      "customerNote"
    );


  function formatRupiah(value) {

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
      }
    ).format(
      Number(value) || 0
    );

  }


  function getQuantity() {

    let quantity =
      parseInt(
        quantityInput.value,
        10
      );


    if (
      !quantity ||
      quantity < 1
    ) {

      quantity = 1;

      quantityInput.value =
        1;

    }


    return quantity;

  }


  function getVariant() {

    return variants[
      selectedVariant
    ];

  }


  function renderPackageContents() {

    const variant =
      getVariant();


    packageContentList.innerHTML =
      variant.contents
        .map(
          item =>
            `<li>${item}</li>`
        )
        .join("");

  }


  function updateSummary() {

    const variant =
      getVariant();


    const quantity =
      getQuantity();


    const total =
      variant.price *
      quantity;


    previewPackageName.textContent =
      variant.name;


    selectedPackageLabel.textContent =
      variant.name;


    packageContentName.textContent =
      variant.name;


    summaryPackage.textContent =
      variant.name;


    summaryUnitPrice.textContent =
      formatRupiah(
        variant.price
      );


    summaryQuantity.textContent =
      `${quantity} pcs`;


    summaryTotal.textContent =
      formatRupiah(
        total
      );


    if (
      productImage
    ) {

      productImage.src =
        variant.image;


      productImage.alt =
        `Classic Folded Invitation ${variant.name}`;

    }


    renderPackageContents();

  }


  function getCart() {

    try {

      return JSON.parse(
        localStorage.getItem(
          "memora_cart"
        )
      ) || [];

    }
    catch {

      return [];

    }

  }


  function saveCart(cart) {

    localStorage.setItem(
      "memora_cart",
      JSON.stringify(
        cart
      )
    );


    window.dispatchEvent(
      new Event(
        "memora-cart-updated"
      )
    );


    if (
      typeof window.memoraUpdateCartCount ===
      "function"
    ) {

      window.memoraUpdateCartCount();

    }

  }


  function showToast() {

    if (!cartToast) {
      return;
    }


    cartToast.classList.add(
      "show"
    );


    setTimeout(
      () => {

        cartToast.classList.remove(
          "show"
        );

      },
      2400
    );

  }


  function addToCart() {

    const variant =
      getVariant();


    const quantity =
      getQuantity();


    const subtotal =
      variant.price *
      quantity;


    const personalization = {

      brideName: {
        label:
          "Nama Mempelai Wanita",

        value:
          brideName.value.trim() || "-"
      },

      groomName: {
        label:
          "Nama Mempelai Pria",

        value:
          groomName.value.trim() || "-"
      },

      eventDate: {
        label:
          "Tanggal Acara",

        value:
          eventDate.value || "-"
      },

      theme: {
        label:
          "Tema / Warna",

        value:
          invitationTheme.value.trim() ||
          "-"
      },

      size: {
        label:
          "Ukuran",

        value:
          invitationSize.value
      },

      foldType: {
        label:
          "Model Lipatan",

        value:
          foldType.value
      },

      note: {
        label:
          "Catatan",

        value:
          customerNote.value.trim() ||
          "-"
      }

    };


    const cartItem = {

      cartItemId:
        "classic-invitation-" +
        Date.now(),

      productId:
        "classic-invitation",

      productName:
        "Classic Folded Invitation",

      variant:
        selectedVariant,

      variantName:
        variant.name,

      variantImage:
        variant.image,

      packageContents:
        variant.contents,

      unitPrice:
        variant.price,

      quantity:
        quantity,

      subtotal:
        subtotal,

      personalization:
        personalization,

      addedAt:
        new Date().toISOString()

    };


    const cart =
      getCart();


    cart.push(
      cartItem
    );


    saveCart(
      cart
    );


    addToCartButton.textContent =
      "Berhasil Ditambahkan ✓";


    showToast();


    setTimeout(
      () => {

        addToCartButton.textContent =
          "Tambah ke Keranjang";

      },
      1600
    );

  }


  variantButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          variantButtons.forEach(
            item => {

              item.classList.remove(
                "active"
              );

            }
          );


          button.classList.add(
            "active"
          );


          selectedVariant =
            button.dataset.variant;


          updateSummary();

        }
      );

    }
  );


  decreaseQuantity.addEventListener(
    "click",
    () => {

      let quantity =
        getQuantity();


      if (
        quantity > 1
      ) {

        quantity--;

      }


      quantityInput.value =
        quantity;


      updateSummary();

    }
  );


  increaseQuantity.addEventListener(
    "click",
    () => {

      let quantity =
        getQuantity();


      quantity++;


      quantityInput.value =
        quantity;


      updateSummary();

    }
  );


  quantityInput.addEventListener(
    "input",
    updateSummary
  );


  addToCartButton.addEventListener(
    "click",
    addToCart
  );


  updateSummary();

});
