(function () {

  "use strict";


  const client =
    window.memoraSupabase;


  if (!client) {
    return;
  }


  const state = {

    userId:
      null,

    customerId:
      null,

    ready:
      false

  };


  function readAddress() {

    try {

      const raw =
        localStorage.getItem(
          "memora_checkout_address"
        );


      if (!raw) {
        return null;
      }


      return JSON.parse(raw);

    }
    catch (error) {

      console.error(
        "Checkout address:",
        error
      );


      return null;

    }

  }


  async function loadCurrentCustomer() {

    const {
      data
    } =
      await client
        .auth
        .getSession();


    const user =
      data?.session?.user;


    if (!user) {
      return;
    }


    state.userId =
      user.id;


    const {
      data: customer,
      error
    } =
      await client
        .from("customers")
        .select("id")
        .eq(
          "auth_user_id",
          user.id
        )
        .maybeSingle();


    if (error) {

      console.error(
        "Current checkout customer:",
        error
      );

      return;

    }


    if (customer) {

      state.customerId =
        customer.id;

    }


    state.ready =
      true;

  }


  /*
   * Supabase order insert guard.
   *
   * order.js existing tetap bekerja,
   * tetapi customer_id selalu ditimpa
   * menggunakan akun yang sedang login.
   */

  const originalFrom =
    client.from.bind(client);


  client.from =
    function (table) {

      const builder =
        originalFrom(table);


      if (
        table !== "orders"
      ) {

        return builder;

      }


      const originalInsert =
        builder.insert.bind(builder);


      builder.insert =
        function (
          values,
          options
        ) {

          const address =
            readAddress();


          const patchRow =
            function (row) {

              const result = {
                ...row
              };


              if (state.customerId) {

                result.customer_id =
                  state.customerId;

              }


              if (address) {

                result.shipping_address_id =
                  address.id || null;

                result.shipping_label =
                  address.label || null;

                result.shipping_recipient_name =
                  address.recipient_name || null;

                result.shipping_phone =
                  address.phone || null;

                result.shipping_province =
                  address.province || null;

                result.shipping_city =
                  address.city || null;

                result.shipping_district =
                  address.district || null;

                result.shipping_village =
                  address.village || null;

                result.shipping_postal_code =
                  address.postal_code || null;

                result.shipping_address_line =
                  address.address_line || null;

                result.shipping_landmark =
                  address.landmark || null;

              }


              return result;

            };


          const patched =
            Array.isArray(values)
              ? values.map(patchRow)
              : patchRow(values);


          return originalInsert(
            patched,
            options
          );

        };


      return builder;

    };


  loadCurrentCustomer();


})();
