(function () {

  "use strict";


  document.addEventListener(
    "DOMContentLoaded",
    function () {

      const form =
        document.getElementById(
          "loginForm"
        );

      const email =
        document.getElementById(
          "loginEmail"
        );

      const password =
        document.getElementById(
          "loginPassword"
        );

      const button =
        document.getElementById(
          "loginButton"
        );

      const message =
        document.getElementById(
          "loginMessage"
        );


      function showMessage(
        text,
        type
      ) {

        message.textContent =
          text;

        message.className =
          "login-message " +
          type;

      }


      function getClient() {

        return (
          window.memoraSupabase ||
          null
        );

      }


      form.addEventListener(
        "submit",
        async function (event) {

          event.preventDefault();


          const db =
            getClient();


          if (!db) {

            showMessage(
              "Supabase belum terhubung.",
              "error"
            );

            return;

          }


          button.disabled =
            true;

          button.textContent =
            "Memeriksa akun...";


          try {

            const authResult =
              await db.auth
                .signInWithPassword({

                  email:
                    email.value.trim(),

                  password:
                    password.value

                });


            if (
              authResult.error
            ) {

              throw authResult.error;

            }


            const user =
              authResult.data.user;


            if (!user) {

              throw new Error(
                "Data user tidak ditemukan."
              );

            }


            const profileResult =
              await db
                .from("profiles")
                .select(
                  "id,full_name,role"
                )
                .eq(
                  "id",
                  user.id
                )
                .maybeSingle();


            if (
              profileResult.error
            ) {

              throw profileResult.error;

            }


            const profile =
              profileResult.data;


            if (!profile) {

              await db.auth.signOut();

              throw new Error(
                "Profile admin tidak ditemukan."
              );

            }


            const role =
              String(
                profile.role ||
                ""
              )
                .trim()
                .toLowerCase();


            if (
              role !== "owner" &&
              role !== "admin"
            ) {

              await db.auth.signOut();


              throw new Error(
                "Akun ini tidak memiliki akses Admin MEMORA."
              );

            }


            showMessage(
              "Login berhasil.",
              "success"
            );


            window.location.replace(
              "/studio/dashboard/"
            );

          }
          catch (error) {

            console.error(
              "ADMIN LOGIN:",
              error
            );


            showMessage(
              error?.message ||
              "Login gagal.",
              "error"
            );

          }
          finally {

            button.disabled =
              false;

            button.textContent =
              "Masuk ke Studio";

          }

        }
      );

    }
  );

})();