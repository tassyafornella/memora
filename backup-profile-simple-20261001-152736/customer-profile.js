(function () {

  "use strict";


  const supabase =
    window.memoraSupabase;


  const form =
    document.getElementById(
      "customerProfileForm"
    );


  const message =
    document.getElementById(
      "profileMessage"
    );


  let currentUser =
    null;


  function showMessage(
    text,
    type
  ) {

    if (!message) {
      return;
    }


    message.textContent =
      text;


    message.className =
      `account-message show ${type}`;

  }


  async function loadProfile() {

    if (!supabase) {
      return;
    }


    const {
      data,
      error
    } =
      await supabase.auth.getSession();


    if (
      error ||
      !data?.session
    ) {
      return;
    }


    currentUser =
      data.session.user;


    document
      .getElementById(
        "profileEmail"
      )
      .value =
      currentUser.email || "";


    const {
      data: customer,
      error: customerError
    } =
      await supabase
        .from("customers")
        .select(
          "full_name, whatsapp, email, address, city, postal_code"
        )
        .eq(
          "auth_user_id",
          currentUser.id
        )
        .maybeSingle();


    if (customerError) {

      console.error(
        customerError
      );

      showMessage(
        "Profil belum dapat dimuat.",
        "error"
      );

      return;
    }


    if (!customer) {
      return;
    }


    document
      .getElementById(
        "profileFullName"
      )
      .value =
      customer.full_name || "";


    document
      .getElementById(
        "profileWhatsapp"
      )
      .value =
      customer.whatsapp || "";


    document
      .getElementById(
        "profileAddress"
      )
      .value =
      customer.address || "";


    document
      .getElementById(
        "profileCity"
      )
      .value =
      customer.city || "";


    document
      .getElementById(
        "profilePostalCode"
      )
      .value =
      customer.postal_code || "";

  }


  async function saveProfile(
    event
  ) {

    event.preventDefault();


    if (
      !currentUser ||
      !supabase
    ) {
      return;
    }


    const payload = {

      full_name:
        document
          .getElementById(
            "profileFullName"
          )
          .value
          .trim(),

      whatsapp:
        document
          .getElementById(
            "profileWhatsapp"
          )
          .value
          .trim(),

      address:
        document
          .getElementById(
            "profileAddress"
          )
          .value
          .trim(),

      city:
        document
          .getElementById(
            "profileCity"
          )
          .value
          .trim(),

      postal_code:
        document
          .getElementById(
            "profilePostalCode"
          )
          .value
          .trim(),

      updated_at:
        new Date()
          .toISOString()

    };


    const {
      error
    } =
      await supabase
        .from("customers")
        .update(payload)
        .eq(
          "auth_user_id",
          currentUser.id
        );


    if (error) {

      console.error(error);

      showMessage(
        "Perubahan belum berhasil disimpan.",
        "error"
      );

      return;
    }


    showMessage(
      "Profil berhasil diperbarui.",
      "success"
    );

  }


  if (form) {

    form.addEventListener(
      "submit",
      saveProfile
    );

  }


  document.addEventListener(
    "DOMContentLoaded",
    loadProfile
  );

})();
