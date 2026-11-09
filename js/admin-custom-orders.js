document.addEventListener("DOMContentLoaded", () => {

  MemoraAdmin.start(async () => {

    const db =
      MemoraAdmin.db;

    const page =
      document.getElementById(
        "adminPage"
      );


    page.innerHTML = `

      <div class="page-head">

        <div>

          <div class="eyebrow">
            Private Order
          </div>

          <h1>
            Custom Orders
          </h1>

          <p>
            Kelola private link untuk kebutuhan custom customer.
          </p>

        </div>

        <div class="actions">

          <button
            class="btn btn-primary"
            id="newCustomOrder"
            type="button"
          >
            New Custom Order
          </button>

        </div>

      </div>


      <div class="stats" id="customStats"></div>


      <section class="panel">

        <div class="table-wrap">

          <table>

            <thead>

              <tr>
                <th>Customer</th>
                <th>Token</th>
                <th>Status</th>
                <th>Created</th>
                <th>Private Link</th>
              </tr>

            </thead>

            <tbody id="customRows"></tbody>

          </table>

        </div>

      </section>


      <div
        class="modal"
        id="customModal"
        hidden
      >

        <div class="modal-card">

          <div class="modal-head">

            <h2>
              New Custom Order
            </h2>

            <button
              class="btn"
              id="closeCustomModal"
              type="button"
            >
              Close
            </button>

          </div>

          <div class="modal-body">

            <div class="field">

              <label>
                Customer Name
              </label>

              <input
                id="customCustomerName"
                placeholder="Nama customer"
              >

            </div>

            <div class="field">

              <label>
                Customer WhatsApp
              </label>

              <input
                id="customWhatsapp"
                placeholder="08..."
              >

            </div>

            <div class="field">

              <label>
                Notes
              </label>

              <textarea
                id="customNotes"
                placeholder="Kebutuhan customer..."
              ></textarea>

            </div>

            <div class="custom-summary">

              Private link akan dibuat menggunakan token unik.

            </div>

          </div>

          <div class="modal-foot">

            <button
              class="btn"
              id="cancelCustomModal"
              type="button"
            >
              Cancel
            </button>

            <button
              class="btn btn-primary"
              id="saveCustomOrder"
              type="button"
            >
              Generate Private Link
            </button>

          </div>

        </div>

      </div>
    `;


    /*
     * Schema custom order lama bisa berbeda antar versi.
     * Query memakai select("*") agar tetap fleksibel.
     */

    const result =
      await db
        .from(
          "custom_order_links"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending:false
          }
        );


    if (result.error) {

      document.getElementById(
        "customRows"
      ).innerHTML = `

        <tr>

          <td
            colspan="5"
            class="empty"
          >
            Table custom_order_links belum tersedia atau belum diberi akses.
            <br><br>
            ${MemoraAdmin.escapeHtml(
              result.error.message
            )}
          </td>

        </tr>
      `;


      document.getElementById(
        "customStats"
      ).innerHTML = `

        <div class="stat">
          <span>Total Link</span>
          <strong>0</strong>
        </div>

        <div class="stat">
          <span>Active</span>
          <strong>0</strong>
        </div>

        <div class="stat">
          <span>Used</span>
          <strong>0</strong>
        </div>

        <div class="stat">
          <span>Expired</span>
          <strong>0</strong>
        </div>
      `;

      return;
    }


    const rows =
      result.data || [];


    function getName(item) {

      return (
        item.customer_name ||
        item.name ||
        item.full_name ||
        "-"
      );

    }


    function getStatus(item) {

      if (
        item.used_at ||
        item.is_used === true
      ) {
        return "Used";
      }

      if (
        item.is_active === false
      ) {
        return "Inactive";
      }

      return (
        item.status ||
        "Active"
      );

    }


    function getToken(item) {

      return (
        item.token ||
        item.public_token ||
        item.access_token ||
        "-"
      );

    }


    function render() {

      const used =
        rows.filter(item =>
          getStatus(item) ===
          "Used"
        ).length;


      const active =
        rows.filter(item =>
          getStatus(item) ===
          "Active"
        ).length;


      document.getElementById(
        "customStats"
      ).innerHTML = `

        <div class="stat">
          <span>Total Link</span>
          <strong>${rows.length}</strong>
        </div>

        <div class="stat">
          <span>Active</span>
          <strong>${active}</strong>
        </div>

        <div class="stat">
          <span>Used</span>
          <strong>${used}</strong>
        </div>

        <div class="stat">
          <span>Other</span>
          <strong>${rows.length - active - used}</strong>
        </div>
      `;


      document.getElementById(
        "customRows"
      ).innerHTML =
        rows.map(item => {

          const token =
            getToken(item);


          const url =
            token !== "-"
              ? `${location.origin}/custom-order/?token=${encodeURIComponent(token)}`
              : "-";


          return `

            <tr>

              <td>
                <strong>
                  ${
                    MemoraAdmin.escapeHtml(
                      getName(item)
                    )
                  }
                </strong>
              </td>

              <td>
                <div class="code-box">
                  ${
                    MemoraAdmin.escapeHtml(
                      token
                    )
                  }
                </div>
              </td>

              <td>
                <span class="badge">
                  ${
                    MemoraAdmin.escapeHtml(
                      getStatus(item)
                    )
                  }
                </span>
              </td>

              <td>
                ${
                  MemoraAdmin.date(
                    item.created_at
                  )
                }
              </td>

              <td>
                ${
                  url !== "-"
                    ? `
                        <button
                          class="btn"
                          data-copy="${MemoraAdmin.escapeHtml(url)}"
                          type="button"
                        >
                          Copy Link
                        </button>
                      `
                    : "-"
                }
              </td>

            </tr>
          `;

        }).join("") ||

        `
          <tr>
            <td
              colspan="5"
              class="empty"
            >
              Belum ada custom order link.
            </td>
          </tr>
        `;


      document
        .querySelectorAll(
          "[data-copy]"
        )
        .forEach(button => {

          button.addEventListener(
            "click",
            async () => {

              await navigator.clipboard.writeText(
                button.dataset.copy
              );

              button.textContent =
                "Copied";

            }
          );

        });

    }


    render();


    const modal =
      document.getElementById(
        "customModal"
      );


    function openModal() {
      modal.hidden = false;
    }


    function closeModal() {
      modal.hidden = true;
    }


    document
      .getElementById(
        "newCustomOrder"
      )
      .addEventListener(
        "click",
        openModal
      );


    document
      .getElementById(
        "closeCustomModal"
      )
      .addEventListener(
        "click",
        closeModal
      );


    document
      .getElementById(
        "cancelCustomModal"
      )
      .addEventListener(
        "click",
        closeModal
      );


    document
      .getElementById(
        "saveCustomOrder"
      )
      .addEventListener(
        "click",
        async () => {

          const customerName =
            document.getElementById(
              "customCustomerName"
            ).value.trim();


          const whatsapp =
            document.getElementById(
              "customWhatsapp"
            ).value.trim();


          const notes =
            document.getElementById(
              "customNotes"
            ).value.trim();


          if (!customerName) {

            alert(
              "Nama customer wajib diisi."
            );

            return;
          }


          const token =
            crypto.randomUUID()
              .replaceAll(
                "-",
                ""
              );


          const payload = {
            token:
              token,

            customer_name:
              customerName,

            whatsapp:
              whatsapp || null,

            notes:
              notes || null,

            status:
              "active",

            is_active:
              true
          };


          const insertResult =
            await db
              .from(
                "custom_order_links"
              )
              .insert(
                payload
              )
              .select("*")
              .single();


          if (insertResult.error) {

            alert(
              insertResult.error.message
            );

            return;
          }


          window.location.reload();

        }
      );

  });

});