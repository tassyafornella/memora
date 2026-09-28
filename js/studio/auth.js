/* =========================================================
   MEMORA STUDIO AUTH
   ========================================================= */

(() => {

  "use strict";


  const supabase =
    window.memoraSupabase;


  const LOGIN_PATH =
    "/studio/login/";


  const DASHBOARD_PATH =
    "/studio/dashboard/";


  /* =====================================================
     HELPERS
     ===================================================== */

  function isLoginPage() {

    return window.location.pathname
      .replace(/\/+$/, "")
      .endsWith(
        "/studio/login"
      );

  }


  function getRedirectTarget() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    const redirect =
      params.get(
        "redirect"
      );


    if (
      redirect &&
      redirect.startsWith(
        "/studio/"
      ) &&
      !redirect.startsWith(
        "/studio/login"
      )
    ) {

      return redirect;

    }


    return DASHBOARD_PATH;

  }


  function redirectToLogin() {

    const currentPath =
      window.location.pathname +
      window.location.search;


    const target =
      LOGIN_PATH +
      "?redirect=" +
      encodeURIComponent(
        currentPath
      );


    window.location.replace(
      target
    );

  }


  function redirectToDashboard() {

    window.location.replace(
      getRedirectTarget()
    );

  }


  function normalizeRole(value) {

    return String(
      value || ""
    )
      .trim()
      .toLowerCase();

  }


  function roleIsOwner(profile) {

    if (!profile) {
      return false;
    }


    const role =
      normalizeRole(
        profile.role
      );


    return (
      role === "owner" ||
      role === "admin"
    );

  }


  /* =====================================================
     PROFILE
     ===================================================== */

  async function getProfile(userId) {

    if (
      !supabase ||
      !userId
    ) {

      return {
        profile: null,
        error: null
      };

    }


    const response =
      await supabase
        .from("profiles")
        .select("*")
        .eq(
          "id",
          userId
        )
        .maybeSingle();


    return {
      profile:
        response.data || null,

      error:
        response.error || null
    };

  }


  async function getCurrentAuth() {

    if (!supabase) {

      return {
        user: null,
        session: null,
        profile: null,
        isOwner: false,
        error:
          new Error(
            "Supabase belum dikonfigurasi."
          )
      };

    }


    const sessionResponse =
      await supabase.auth
        .getSession();


    if (
      sessionResponse.error
    ) {

      return {
        user: null,
        session: null,
        profile: null,
        isOwner: false,
        error:
          sessionResponse.error
      };

    }


    const session =
      sessionResponse
        .data
        .session;


    const user =
      session?.user || null;


    if (!user) {

      return {
        user: null,
        session: null,
        profile: null,
        isOwner: false,
        error: null
      };

    }


    const profileResult =
      await getProfile(
        user.id
      );


    return {
      user,
      session,
      profile:
        profileResult.profile,
      isOwner:
        roleIsOwner(
          profileResult.profile
        ),
      error:
        profileResult.error
    };

  }


  /* =====================================================
     LOGIN
     ===================================================== */

  async function login(
    email,
    password
  ) {

    if (!supabase) {

      throw new Error(
        "Supabase belum dikonfigurasi."
      );

    }


    const response =
      await supabase.auth
        .signInWithPassword({
          email,
          password
        });


    if (
      response.error
    ) {

      throw response.error;

    }


    const user =
      response
        .data
        .user;


    if (!user) {

      throw new Error(
        "User tidak ditemukan."
      );

    }


    const profileResult =
      await getProfile(
        user.id
      );


    if (
      profileResult.error
    ) {

      await supabase.auth
        .signOut();

      throw profileResult.error;

    }


    if (
      !roleIsOwner(
        profileResult.profile
      )
    ) {

      await supabase.auth
        .signOut();


      throw new Error(
        "Akun ini tidak memiliki akses owner Memora Studio."
      );

    }


    return {
      user,
      profile:
        profileResult.profile
    };

  }


  /* =====================================================
     LOGOUT
     ===================================================== */

  async function logout() {

    if (supabase) {

      await supabase.auth
        .signOut();

    }


    window.location.replace(
      LOGIN_PATH
    );

  }


  /* =====================================================
     PROTECT STUDIO PAGE
     ===================================================== */

  async function requireOwner() {

    if (
      isLoginPage()
    ) {
      return true;
    }


    const auth =
      await getCurrentAuth();


    if (
      !auth.user ||
      !auth.isOwner
    ) {

      redirectToLogin();

      return false;

    }


    return true;

  }


  /* =====================================================
     LOGIN PAGE UI
     ===================================================== */

  async function initializeLoginPage() {

    const form =
      document.getElementById(
        "studioLoginForm"
      );


    if (!form) {
      return;
    }


    const emailInput =
      document.getElementById(
        "studioEmail"
      );


    const passwordInput =
      document.getElementById(
        "studioPassword"
      );


    const togglePassword =
      document.getElementById(
        "togglePassword"
      );


    const rememberLogin =
      document.getElementById(
        "rememberLogin"
      );


    const submitButton =
      document.getElementById(
        "loginSubmitButton"
      );


    const submitText =
      document.getElementById(
        "loginSubmitText"
      );


    const errorBox =
      document.getElementById(
        "loginError"
      );


    const successBox =
      document.getElementById(
        "loginSuccess"
      );


    function clearMessages() {

      errorBox.textContent =
        "";

      errorBox.classList.remove(
        "show"
      );


      successBox.textContent =
        "";

      successBox.classList.remove(
        "show"
      );

    }


    function showError(message) {

      successBox.classList.remove(
        "show"
      );


      errorBox.textContent =
        message;


      errorBox.classList.add(
        "show"
      );

    }


    function showSuccess(message) {

      errorBox.classList.remove(
        "show"
      );


      successBox.textContent =
        message;


      successBox.classList.add(
        "show"
      );

    }


    function setLoading(value) {

      submitButton.disabled =
        value;


      submitButton.classList.toggle(
        "loading",
        value
      );


      submitText.textContent =
        value
          ? "Memeriksa akun..."
          : "Masuk ke Studio";

    }


    togglePassword.addEventListener(
      "click",
      () => {

        const isPassword =
          passwordInput.type ===
          "password";


        passwordInput.type =
          isPassword
            ? "text"
            : "password";


        togglePassword.textContent =
          isPassword
            ? "HIDE"
            : "SHOW";

      }
    );


    emailInput.addEventListener(
      "input",
      clearMessages
    );


    passwordInput.addEventListener(
      "input",
      clearMessages
    );


    /*
     * Cek apakah user sudah login.
     */

    if (!supabase) {

      showError(
        "Supabase belum dikonfigurasi. Periksa js/supabase.js."
      );

      return;

    }


    try {

      const current =
        await getCurrentAuth();


      if (
        current.user &&
        current.isOwner
      ) {

        showSuccess(
          "Session owner ditemukan. Membuka Memora Studio..."
        );


        setTimeout(
          redirectToDashboard,
          350
        );


        return;

      }


      if (
        current.user &&
        !current.isOwner
      ) {

        await supabase.auth
          .signOut();

      }

    }
    catch (error) {

      console.warn(
        "Auth session check:",
        error
      );

    }


    form.addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        clearMessages();


        const email =
          emailInput.value
            .trim()
            .toLowerCase();


        const password =
          passwordInput.value;


        if (!email) {

          showError(
            "Email wajib diisi."
          );

          emailInput.focus();

          return;

        }


        if (!password) {

          showError(
            "Password wajib diisi."
          );

          passwordInput.focus();

          return;

        }


        if (
          password.length < 6
        ) {

          showError(
            "Password minimal 6 karakter."
          );

          passwordInput.focus();

          return;

        }


        setLoading(true);


        try {

          /*
           * Supabase JS secara default menyimpan
           * session ke localStorage.
           *
           * Kalau "Tetap masuk" tidak dicentang,
           * session tetap digunakan selama tab
           * berjalan, lalu kita tandai agar bisa
           * logout saat tab ditutup.
           */

          if (
            rememberLogin.checked
          ) {

            localStorage.setItem(
              "memora_remember_login",
              "true"
            );

          }
          else {

            localStorage.removeItem(
              "memora_remember_login"
            );

            sessionStorage.setItem(
              "memora_session_only",
              "true"
            );

          }


          const auth =
            await login(
              email,
              password
            );


          showSuccess(
            `Login berhasil. Selamat datang ${
              auth.profile?.full_name ||
              auth.profile?.name ||
              "Owner"
            }.`
          );


          setTimeout(
            redirectToDashboard,
            500
          );

        }
        catch (error) {

          console.error(
            "Studio login error:",
            error
          );


          const message =
            String(
              error?.message || ""
            ).toLowerCase();


          if (
            message.includes(
              "invalid login credentials"
            )
          ) {

            showError(
              "Email atau password salah."
            );

          }
          else if (
            message.includes(
              "email not confirmed"
            )
          ) {

            showError(
              "Email akun belum dikonfirmasi."
            );

          }
          else if (
            message.includes(
              "owner"
            )
          ) {

            showError(
              "Akun ini tidak memiliki akses owner Memora Studio."
            );

          }
          else {

            showError(
              error?.message ||
              "Login belum berhasil. Silakan coba kembali."
            );

          }

        }
        finally {

          setLoading(false);

        }

      }
    );

  }


  /* =====================================================
     AUTH STATE
     ===================================================== */

  if (supabase) {

    supabase.auth
      .onAuthStateChange(
        (
          event,
          session
        ) => {

          window.dispatchEvent(
            new CustomEvent(
              "memora-auth-change",
              {
                detail: {
                  event,
                  session
                }
              }
            )
          );

        }
      );

  }


  /* =====================================================
     EXPOSE GLOBAL HELPERS
     ===================================================== */

  window.memoraAuth = {

    login,

    logout,

    getCurrentAuth,

    getProfile,

    requireOwner,

    isOwnerProfile:
      roleIsOwner

  };


  /* =====================================================
     START
     ===================================================== */

  document.addEventListener(
    "DOMContentLoaded",
    async () => {

      if (
        isLoginPage()
      ) {

        await initializeLoginPage();

      }

    }
  );


})();
