(function () {

  "use strict";


  function db() {

    return window.memoraSupabase || null;

  }


  function showMessage(
    id,
    message,
    type
  ) {

    const element =
      document.getElementById(id);


    if (!element) {
      return;
    }


    element.textContent =
      message;


    element.className =
      `auth-message show ${type}`;

  }


  async function handleForgotPassword(event) {

    event.preventDefault();


    const supabase =
      db();


    if (!supabase) {

      showMessage(
        "forgotPasswordMessage",
        "Supabase belum terhubung.",
        "error"
      );

      return;

    }


    const email =
      document
        .getElementById("forgotEmail")
        ?.value
        .trim();


    const button =
      document.getElementById(
        "forgotPasswordButton"
      );


    if (!email) {
      return;
    }


    button.disabled =
      true;

    button.textContent =
      "Mengirim...";


    try {

      const redirectTo =
        `${window.location.origin}/account/reset-password/`;


      const {
        error
      } =
        await supabase.auth
          .resetPasswordForEmail(
            email,
            {
              redirectTo
            }
          );


      if (error) {
        throw error;
      }


      showMessage(
        "forgotPasswordMessage",
        "Link reset password sudah dikirim. Silakan cek email kamu.",
        "success"
      );

    }
    catch (error) {

      console.error(
        "Forgot password:",
        error
      );


      showMessage(
        "forgotPasswordMessage",
        error?.message ||
        "Link reset password belum berhasil dikirim.",
        "error"
      );

    }
    finally {

      button.disabled =
        false;

      button.textContent =
        "Kirim Link Reset Password";

    }

  }


  async function prepareRecoverySession() {

    const supabase =
      db();


    if (!supabase) {
      return false;
    }


    const params =
      new URLSearchParams(
        window.location.search
      );


    const code =
      params.get("code");


    if (code) {

      const {
        error
      } =
        await supabase.auth
          .exchangeCodeForSession(
            code
          );


      if (
        error &&
        !String(error.message || "")
          .toLowerCase()
          .includes("code verifier")
      ) {

        console.warn(
          "Recovery exchange:",
          error
        );

      }

    }


    const {
      data
    } =
      await supabase.auth
        .getSession();


    return Boolean(
      data?.session
    );

  }


  async function handleResetPassword(event) {

    event.preventDefault();


    const supabase =
      db();


    if (!supabase) {

      showMessage(
        "resetPasswordMessage",
        "Supabase belum terhubung.",
        "error"
      );

      return;

    }


    const password =
      document
        .getElementById(
          "newPassword"
        )
        ?.value || "";


    const confirm =
      document
        .getElementById(
          "confirmNewPassword"
        )
        ?.value || "";


    const button =
      document.getElementById(
        "resetPasswordButton"
      );


    if (
      password.length < 8
    ) {

      showMessage(
        "resetPasswordMessage",
        "Password minimal 8 karakter.",
        "error"
      );

      return;

    }


    if (
      password !== confirm
    ) {

      showMessage(
        "resetPasswordMessage",
        "Konfirmasi password tidak sama.",
        "error"
      );

      return;

    }


    button.disabled =
      true;

    button.textContent =
      "Menyimpan...";


    try {

      const ready =
        await prepareRecoverySession();


      if (!ready) {

        throw new Error(
          "Link reset password tidak valid atau sudah kedaluwarsa. Silakan minta link baru."
        );

      }


      const {
        error
      } =
        await supabase.auth
          .updateUser({
            password
          });


      if (error) {
        throw error;
      }


      showMessage(
        "resetPasswordMessage",
        "Password berhasil diperbarui. Kamu bisa masuk menggunakan password baru.",
        "success"
      );


      button.textContent =
        "Password Berhasil Disimpan";


      setTimeout(
        function () {

          window.location.href =
            "../login/";

        },
        1800
      );

    }
    catch (error) {

      console.error(
        "Reset password:",
        error
      );


      showMessage(
        "resetPasswordMessage",
        error?.message ||
        "Password belum berhasil diperbarui.",
        "error"
      );


      button.disabled =
        false;

      button.textContent =
        "Simpan Password Baru";

    }

  }


  function setupPasswordToggle() {

    document
      .querySelectorAll(
        "[data-toggle-password]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              const input =
                document.getElementById(
                  button.dataset
                    .togglePassword
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


  document.addEventListener(
    "DOMContentLoaded",
    async function () {

      setupPasswordToggle();


      document
        .getElementById(
          "forgotPasswordForm"
        )
        ?.addEventListener(
          "submit",
          handleForgotPassword
        );


      document
        .getElementById(
          "resetPasswordForm"
        )
        ?.addEventListener(
          "submit",
          handleResetPassword
        );


      if (
        document.getElementById(
          "resetPasswordForm"
        )
      ) {

        await prepareRecoverySession();

      }

    }
  );


})();
