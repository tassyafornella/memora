document.addEventListener("DOMContentLoaded", () => {

  MemoraAdmin.start(async () => {

    const db = MemoraAdmin.db;
    const page = document.getElementById("adminPage");

    page.innerHTML = `
      <div class="page-head">
        <div>
          <div class="eyebrow">Workflow</div>
          <h1>Production</h1>
          <p>Pantau status produksi setiap order.</p>
        </div>
      </div>

      <div class="production-grid" id="productionGrid"></div>
    `;

    const { data, error } =
      await db
        .from("orders")
        .select("*")
        .not(
          "status",
          "in",
          '("selesai","dibatalkan")'
        )
        .order("created_at", {
          ascending:false
        });

    if (error) throw error;

    const orders =
      data || [];

    const statuses = [
      "desain",
      "menunggu_approval",
      "produksi",
      "finishing",
      "quality_check",
      "packing",
      "dikirim",
      "selesai"
    ];

    function render() {

      document.getElementById("productionGrid").innerHTML =
        orders.map(order => `
          <article class="production-card">

            <h3>
              ${MemoraAdmin.escapeHtml(order.order_number)}
            </h3>

            <p>
              ${MemoraAdmin.money(order.grand_total)}
            </p>

            <div class="field">
              <label>Status Produksi</label>

              <select data-production="${order.id}">
                ${statuses.map(status => `
                  <option
                    value="${status}"
                    ${status === order.status ? "selected" : ""}
                  >
                    ${MemoraAdmin.statusLabel(status)}
                  </option>
                `).join("")}
              </select>
            </div>

            <button
              class="btn btn-primary btn-block"
              data-save-production="${order.id}"
            >
              Save Stage
            </button>

          </article>
        `).join("") ||
        `<div class="empty">Tidak ada order produksi aktif.</div>`;

      document
        .querySelectorAll("[data-save-production]")
        .forEach(button => {

          button.addEventListener("click", async () => {

            const id =
              button.dataset.saveProduction;

            const status =
              document.querySelector(
                `[data-production="${id}"]`
              ).value;

            const { error } =
              await db
                .from("orders")
                .update({ status })
                .eq("id", id);

            if (error) {
              alert(error.message);
              return;
            }

            const item =
              orders.find(x => x.id === id);

            if (item) item.status = status;

            alert("Status produksi berhasil diperbarui.");

          });

        });

    }

    render();

  });

});