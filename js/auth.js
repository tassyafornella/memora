(function () {

  "use strict";


  const db =
    window.memoraSupabase;


  function el(id) {

    return document.getElementById(
      id
    );

  }


  function showMessage(
    id,
    text,
    type
  ) {

    const box =
      el(id);


    if (!box) {
      return;
    }


    box.hidden =
      false;


    box.textContent =
      text;


    box.className =
      `auth-message ${type}`;

  }


  function hideMessage(id) {

    const box =
      el(id);


    if (!box) {
      return;
    }


    box.hidden =
      true;


    box.textContent =
      "";

  }


  function normalizeWhatsapp(value) {

    return String(
      value || ""
    )
      .replace(
        /[^\d+]/g,
        ""
      )
      .trim();

  }


  function getNext() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    const next =
      params.get(
        "next"
      );


    if (
      next &&
      next.startsWith("/") &&
      !next.startsWith("//")
    ) {

      return next;

    }


    const stored =
      localStorage.getItem(
        "memora_after_auth"
      );


    if (
      stored &&
      stored.startsWith("/") &&
      !stored.startsWith("//")
    ) {

      return stored;

    }


    return "/";

  }


  function clearNext() {

    localStorage.removeItem(
      "memora_after_auth"
    );

  }


  function syncAuthLinks() {

    const next =
      new URLSearchParams(
        window.location.search
      ).get(
        "next"
      );


    if (!next) {
      return;
    }


    const loginLink =
      el(
        "loginLink"
      );


    const registerLink =
      el(
        "registerLink"
      );


    if (loginLink) {

      loginLink.href =
        "/account/login/?next=" +
        encodeURIComponent(
          next
        );

    }


    if (registerLink) {

      registerLink.href =
        "/account/register/?next=" +
        encodeURIComponent(
          next
        );

    }

  }


  function setupPasswordToggles() {

    document
      .querySelectorAll(
        "[data-password-toggle]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const input =
                el(
                  button.dataset
                    .passwordToggle
                );


              if (!input) {
                return;
              }


              const hidden =
                input.type ===
                "password";


              input.type =
                hidden
                  ? "text"
                  : "password";


              button.textContent =
                hidden
                  ? "Sembunyi"
                  : "Lihat";

            }
          );

        }
      );

  }


  /* ========================================================
     LOGIN - TC-02 / TC-03
  ======================================================== */

  async function handleLogin(
    event
  ) {

    event.preventDefault();


    hideMessage(
      "loginMessage"
    );


    if (!db) {

      showMessage(
        "loginMessage",
        "Koneksi Supabase belum tersedia.",
        "error"
      );

      return;

    }


    const email =
      el(
        "loginEmail"
      ).value.trim();


    const password =
      el(
        "loginPassword"
      ).value;


    const button =
      el(
        "loginButton"
      );


    button.disabled =
      true;


    button.textContent =
      "Login...";


    try {

      const {
        error
      } =
        await db.auth
          .signInWithPassword({
            email:
              email,

            password:
              password
          });


      if (error) {
        throw error;
      }


      const destination =
        getNext();


      clearNext();


      window.location.href =
        destination;

    }
    catch (error) {

      console.error(
        "MEMORA Login:",
        error
      );


      /*
       * Untuk TC-03 kita sengaja pakai pesan
       * yang konsisten walaupun Supabase
       * mengembalikan wording berbeda.
       */

      showMessage(
        "loginMessage",
        "Email atau password salah.",
        "error"
      );

    }
    finally {

      button.disabled =
        false;


      button.textContent =
        "Login";

    }

  }


  /* ========================================================
     REGISTER - TC-01
  ======================================================== */

  async function handleRegister(
    event
  ) {

    event.preventDefault();


    hideMessage(
      "registerMessage"
    );


    if (!db) {

      showMessage(
        "registerMessage",
        "Koneksi Supabase belum tersedia.",
        "error"
      );

      return;

    }


    const name =
      el(
        "registerName"
      ).value.trim();


    const email =
      el(
        "registerEmail"
      ).value.trim();


    const whatsapp =
      normalizeWhatsapp(
        el(
          "registerWhatsapp"
        ).value
      );


    const password =
      el(
        "registerPassword"
      ).value;


    const confirm =
      el(
        "registerPasswordConfirm"
      ).value;


    if (
      name.length < 2
    ) {

      showMessage(
        "registerMessage",
        "Nama lengkap wajib diisi.",
        "error"
      );

      return;

    }


    if (
      whatsapp.replace(
        /\D/g,
        ""
      ).length < 9
    ) {

      showMessage(
        "registerMessage",
        "Nomor WhatsApp belum valid.",
        "error"
      );

      return;

    }


    if (
      password.length < 8
    ) {

      showMessage(
        "registerMessage",
        "Password minimal 8 karakter.",
        "error"
      );

      return;

    }


    if (
      password !==
      confirm
    ) {

      showMessage(
        "registerMessage",
        "Konfirmasi password tidak sama.",
        "error"
      );

      return;

    }


    const button =
      el(
        "registerButton"
      );


    button.disabled =
      true;


    button.textContent =
      "Mendaftarkan...";


    try {

      const {
        data,
        error
      } =
        await db.auth
          .signUp({

            email:
              email,

            password:
              password,

            options: {

              data: {

                full_name:
                  name,

                whatsapp:
                  whatsapp,

                account_type:
                  "customer"

              }

            }

          });


      if (error) {
        throw error;
      }


      /*
       * Jika Supabase langsung memberikan session,
       * login otomatis aktif.
       */

      if (
        data?.session
      ) {

        const destination =
          getNext();


        clearNext();


        window.location.href =
          destination;


        return;

      }


      /*
       * Jika Email Confirmation aktif,
       * akun tetap sudah berhasil dibuat
       * tetapi user perlu konfirmasi email.
       */

      showMessage(
        "registerMessage",
        "Akun berhasil dibuat. Silakan cek email jika konfirmasi akun diperlukan.",
        "success"
      );


      event.target.reset();

    }
    catch (error) {

      console.error(
        "MEMORA Register:",
        error
      );


      let message =
        error?.message ||
        "Pendaftaran belum berhasil.";


      const lower =
        String(message)
          .toLowerCase();


      if (
        lower.includes(
          "already registered"
        ) ||
        lower.includes(
          "already been registered"
        )
      ) {

        message =
          "Email sudah terdaftar.";

      }


      showMessage(
        "registerMessage",
        message,
        "error"
      );

    }
    finally {

      button.disabled =
        false;


      button.textContent =
        "Daftar";

    }

  }


  /* ========================================================
     EXISTING SESSION
  ======================================================== */

  async function checkExistingSession() {

    if (!db) {
      return;
    }


    try {

      const {
        data
      } =
        await db.auth
          .getSession();


      if (
        data?.session?.user
      ) {

        /*
         * Jika login/register dibuka karena
         * redirect checkout dan user ternyata
         * sudah login, langsung kembalikan.
         */

        const params =
          new URLSearchParams(
            window.location.search
          );


        if (
          params.get(
            "next"
          )
        ) {

          window.location.href =
            getNext();

        }

      }

    }
    catch (error) {

      console.error(
        "Session check:",
        error
      );

    }

  }


  function init() {

    syncAuthLinks();

    setupPasswordToggles();


    el(
      "loginForm"
    )
      ?.addEventListener(
        "submit",
        handleLogin
      );


    el(
      "registerForm"
    )
      ?.addEventListener(
        "submit",
        handleRegister
      );


    checkExistingSession();

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  }
  else {

    init();

  }


})();