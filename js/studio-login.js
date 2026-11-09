(function () {

  "use strict";


  const db =
    window.memoraSupabase;


  const form =
    document.getElementById(
      "studioLoginForm"
    );


  const message =
    document.getElementById(
      "studioLoginMessage"
    );


  function show(
    value,
    type = "error"
  ) {

    message.textContent =
      value;


    message.className =
      "studio-message " +
      type;

  }


  async function checkAdmin(
    userId
  ) {

    const {
      data,
      error
    } =
      await db
        .from(
          "profiles"
        )
        .select(
          "id, role"
        )
        .eq(
          "id",
          userId
        )
        .maybeSingle();


    if (error) {
      throw error;
    }


    const role =
      String(
        data?.role || ""
      )
        .trim()
        .toLowerCase();


    return (
      role === "owner" ||
      role === "admin"
    );

  }


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      show(
        "",
        ""
      );


      const button =
        document.getElementById(
          "studioLoginButton"
        );


      button.disabled =
        true;


      button.textContent =
        "Login...";


      try {

        const email =
          document.getElementById(
            "studioEmail"
          ).value.trim();


        const password =
          document.getElementById(
            "studioPassword"
          ).value;


        const {
          data,
          error
        } =
          await db.auth
            .signInWithPassword({
              email,
              password
            });


        if (error) {
          throw error;
        }


        const allowed =
          await checkAdmin(
            data.user.id
          );


        if (!allowed) {

          await db.auth
            .signOut();


          throw new Error(
            "Akun ini tidak memiliki akses MEMORA Studio."
          );

        }


        const redirect =
          new URLSearchParams(
            location.search
          ).get(
            "redirect"
          );


        window.location.href =
          (
            redirect &&
            redirect.startsWith(
              "/studio/"
            )
          )
            ? redirect
            : "/studio/payments/";

      }
      catch (error) {

        show(
          error?.message ||
          "Login belum berhasil."
        );

      }
      finally {

        button.disabled =
          false;


        button.textContent =
          "Login";

      }

    }
  );


})();