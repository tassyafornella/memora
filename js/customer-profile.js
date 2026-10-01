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


  const saveButton =
    document.getElementById(
      "saveCustomerProfile"
    );


  let currentUser =
    null;


  /* ========================================================
     MESSAGE
     ======================================================== */

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


  function clearMessage() {

    if (!message) {
      return;
    }


    message.textContent =
      "";


    message.className =
      "account-message";

  }


  /* ========================================================
     NORMALIZE PHONE
     ======================================================== */

  function normalizePhone(value) {

    return String(value || "")
      .replace(/[^\d+]/g, "")
      .trim();

  }


  /* ========================================================
     LOAD PROFILE
     ======================================================== */

  async function loadProfile() {

    if (!supabase) {

      showMessage(
        "Koneksi akun belum tersedia.",
        "error"
      );

      return;

    }


    const {
      data: sessionData,
      error: sessionError
    } =
      await supabase.auth.getSession();


    const session =
      sessionData?.session || null;


    if (
      sessionError ||
      !session
    ) {
      return;
    }


    currentUser =
      session.user;


    const emailInput =
      document.getElementById(
        "profileEmail"
      );


    if (emailInput) {

      emailInput.value =
        currentUser.email || "";

    }


    const {
      data: customer,
      error: customerError
    } =
      await supabase
        .from("customers")
        .select(
          "full_name, whatsapp, email"
        )
        .eq(
          "auth_user_id",
          currentUser.id
        )
        .maybeSingle();


    if (customerError) {

      console.error(
        "Load profile:",
        customerError
      );


      showMessage(
        "Profil belum dapat dimuat.",
        "error"
      );

      return;

    }


    const fullNameInput =
      document.getElementById(
        "profileFullName"
      );


    const whatsappInput =
      document.getElementById(
        "profileWhatsapp"
      );


    if (fullNameInput) {

      fullNameInput.value =
        customer?.full_name ||
        currentUser.user_metadata?.full_name ||
        "";

    }


    if (whatsappInput) {

      whatsappInput.value =
        customer?.whatsapp ||
        currentUser.user_metadata?.whatsapp ||
        "";

    }

  }


  /* ========================================================
     SAVE PROFILE
     ======================================================== */

  async function saveProfile(
    event
  ) {

    event.preventDefault();

    clearMessage();


    if (
      !supabase ||
      !currentUser
    ) {

      showMessage(
        "Sesi akun tidak ditemukan.",
        "error"
      );

      return;

    }


    const fullName =
      document
        .getElementById(
          "profileFullName"
        )
        ?.value
        ?.trim() || "";


    const whatsapp =
      normalizePhone(
        document
          .getElementById(
            "profileWhatsapp"
          )
          ?.value
      );


    if (!fullName) {

      showMessage(
        "Nama lengkap wajib diisi.",
        "error"
      );

      return;

    }


    if (saveButton) {

      saveButton.disabled =
        true;

      saveButton.textContent =
        "Menyimpan...";

    }


    try {

      const payload = {

        full_name:
          fullName,

        whatsapp:
          whatsapp,

        email:
          currentUser.email || null,

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
        throw error;
      }


      /*
       * Sinkronkan metadata nama/WA.
       * Tidak mengubah email/password.
       */

      const {
        error: authError
      } =
        await supabase
          .auth
          .updateUser({

            data: {

              full_name:
                fullName,

              whatsapp:
                whatsapp,

              account_type:
                "customer"

            }

          });


      if (authError) {

        console.warn(
          "Metadata auth tidak tersinkron:",
          authError
        );

      }


      showMessage(
        "Profil berhasil diperbarui.",
        "success"
      );

    }
    catch (error) {

      console.error(
        "Save profile:",
        error
      );


      showMessage(
        "Profil belum berhasil disimpan.",
        "error"
      );

    }
    finally {

      if (saveButton) {

        saveButton.disabled =
          false;

        saveButton.textContent =
          "Simpan Perubahan";

      }

    }

  }


  /* ========================================================
     EVENTS
     ======================================================== */

  if (form) {

    form.addEventListener(
      "submit",
      saveProfile
    );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      loadProfile
    );

  }
  else {

    loadProfile();

  }


})();
