document.addEventListener("DOMContentLoaded", () => {

  const circleData = {
    "10": 13,
    "9": 15,
    "8": 18,
    "7": 25,
    "6": 36,
    "5": 55,
    "4": 84,
    "3": 144,
    "2.5": 208,
    "2": 322,
    "1": 1117
  };

  const roundedData = {
    "10": 12,
    "9": 15,
    "8": 15,
    "7": 24,
    "6": 35,
    "5": 48,
    "4": 76,
    "3": 126,
    "2.5": 186,
    "2": 291,
    "1": 1108
  };

  const materialPrices = {
    Glossy: 7500,
    Matte: 8500
  };

  let selectedShape = "circle";
  let selectedMaterial = "Glossy";

  const shapeButtons =
    document.querySelectorAll("[data-shape]");

  const materialButtons =
    document.querySelectorAll("[data-material]");

  const sizeInput =
    document.getElementById("stickerSize");

  const sheetInput =
    document.getElementById("sheetQuantity");

  const decreaseButton =
    document.getElementById("decreaseSheet");

  const increaseButton =
    document.getElementById("increaseSheet");

  const customShapeNote =
    document.getElementById("customShapeNote");

  const resultShape =
    document.getElementById("resultShape");

  const resultSize =
    document.getElementById("resultSize");

  const resultMaterial =
    document.getElementById("resultMaterial");

  const resultPerSheet =
    document.getElementById("resultPerSheet");

  const resultSheets =
    document.getElementById("resultSheets");

  const resultTotalPcs =
    document.getElementById("resultTotalPcs");

  const resultUnitPrice =
    document.getElementById("resultUnitPrice");

  const resultTotalPrice =
    document.getElementById("resultTotalPrice");

  const addToCartButton =
    document.getElementById("addStickerToCart");

  const stickerName =
    document.getElementById("stickerName");

  const stickerTheme =
    document.getElementById("stickerTheme");

  const stickerNote =
    document.getElementById("stickerNote");


  function formatRupiah(value) {

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
      }
    ).format(Number(value) || 0);

  }


  function getShapeName() {

    if (selectedShape === "circle") {
      return "Bulat / Lingkaran";
    }

    if (selectedShape === "rounded") {
      return "Kotak Rounded";
    }

    return "Custom Shape";
  }


  function getPerSheet() {

    const size = sizeInput.value;

    if (selectedShape === "circle") {
      return circleData[size] || 0;
    }

    if (selectedShape === "rounded") {
      return roundedData[size] || 0;
    }

    return 0;
  }


  function getUnitPrice() {

    return Number(
      materialPrices[selectedMaterial]
    ) || 0;
  }


  function getSheetQuantity() {

    let sheets =
      parseInt(sheetInput.value, 10);

    if (!sheets || sheets < 1) {

      sheets = 1;
      sheetInput.value = 1;

    }

    return sheets;
  }


  function updateResult() {

    const sheets =
      getSheetQuantity();

    const perSheet =
      getPerSheet();

    const totalPcs =
      perSheet * sheets;

    const unitPrice =
      getUnitPrice();

    const totalPrice =
      unitPrice * sheets;

    resultShape.textContent =
      getShapeName();

    resultSize.textContent =
      `${sizeInput.value} x ${sizeInput.value} cm`;

    resultMaterial.textContent =
      selectedMaterial;

    resultSheets.textContent =
      `${sheets} lembar`;

    resultUnitPrice.textContent =
      formatRupiah(unitPrice);

    resultTotalPrice.textContent =
      formatRupiah(totalPrice);

    if (selectedShape === "custom") {

      resultPerSheet.textContent =
        "Menyesuaikan desain";

      resultTotalPcs.textContent =
        "Dikonfirmasi Memora";

      customShapeNote.style.display =
        "block";

    }
    else {

      resultPerSheet.textContent =
        `${perSheet} pcs`;

      resultTotalPcs.textContent =
        `${totalPcs} pcs`;

      customShapeNote.style.display =
        "none";

    }

  }


  function getCart() {

    try {

      return JSON.parse(
        localStorage.getItem("memora_cart")
      ) || [];

    }
    catch {

      return [];

    }

  }


  function saveCart(cart) {

    localStorage.setItem(
      "memora_cart",
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new Event("memora-cart-updated")
    );

    if (
      typeof window.memoraUpdateCartCount ===
      "function"
    ) {

      window.memoraUpdateCartCount();

    }

  }


  function addStickerToCart() {

    const sheets =
      getSheetQuantity();

    const perSheet =
      getPerSheet();

    const totalPcs =
      selectedShape === "custom"
        ? 0
        : perSheet * sheets;

    const unitPrice =
      getUnitPrice();

    const subtotal =
      unitPrice * sheets;

    const cart =
      getCart();

    const cartItem = {

      cartItemId:
        "sticker-" +
        Date.now(),

      productId:
        "sticker",

      productName:
        "Custom Sticker",

      variant:
        selectedMaterial.toLowerCase(),

      variantName:
        selectedMaterial,

      variantImage:
        "../../assets/images/products/sticker/cover.jpg",

      unitPrice:
        unitPrice,

      quantity:
        sheets,

      subtotal:
        subtotal,

      personalization: {

        shape: {
          label: "Bentuk",
          value: getShapeName()
        },

        size: {
          label: "Ukuran",
          value:
            `${sizeInput.value} x ${sizeInput.value} cm`
        },

        material: {
          label: "Bahan",
          value: selectedMaterial
        },

        perSheet: {
          label: "Sticker / Lembar",
          value:
            selectedShape === "custom"
              ? "Menyesuaikan desain"
              : `${perSheet} pcs`
        },

        sheets: {
          label: "Jumlah Lembar",
          value: `${sheets} lembar`
        },

        totalPcs: {
          label: "Estimasi Total Sticker",
          value:
            selectedShape === "custom"
              ? "Dikonfirmasi Memora"
              : `${totalPcs} pcs`
        },

        name: {
          label: "Nama / Teks",
          value:
            stickerName?.value.trim() || "-"
        },

        theme: {
          label: "Tema Warna",
          value:
            stickerTheme?.value.trim() || "-"
        },

        note: {
          label: "Catatan",
          value:
            stickerNote?.value.trim() || "-"
        }

      },

      addedAt:
        new Date().toISOString()

    };

    cart.push(cartItem);

    saveCart(cart);

    addToCartButton.textContent =
      "Berhasil Ditambahkan ✓";

    setTimeout(() => {

      addToCartButton.textContent =
        "Tambah ke Keranjang";

    }, 1600);

  }


  shapeButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        shapeButtons.forEach(item => {
          item.classList.remove("active");
        });

        button.classList.add("active");

        selectedShape =
          button.dataset.shape;

        updateResult();

      }
    );

  });


  materialButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        materialButtons.forEach(item => {
          item.classList.remove("active");
        });

        button.classList.add("active");

        selectedMaterial =
          button.dataset.material;

        updateResult();

      }
    );

  });


  sizeInput.addEventListener(
    "change",
    updateResult
  );


  sheetInput.addEventListener(
    "input",
    updateResult
  );


  decreaseButton.addEventListener(
    "click",
    () => {

      let value =
        getSheetQuantity();

      if (value > 1) {
        value--;
      }

      sheetInput.value =
        value;

      updateResult();

    }
  );


  increaseButton.addEventListener(
    "click",
    () => {

      let value =
        getSheetQuantity();

      value++;

      sheetInput.value =
        value;

      updateResult();

    }
  );


  if (addToCartButton) {

    addToCartButton.addEventListener(
      "click",
      addStickerToCart
    );

  }


  updateResult();

});
