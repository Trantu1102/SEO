const sendBtn = document.getElementById("sendBtn");
const copyBtn = document.getElementById("copyBtn");
const linkInput = document.getElementById("linkInput");
const result = document.getElementById("result");

sendBtn.addEventListener("click", () => {
  const link = linkInput.value.trim();
  if (!link) {
    alert("Vui lòng nhập link preview!");
    return;
  }
  result.innerHTML = "⏳ Đang xử lý...";

  fetch(
    "https://n8n.autowf.xyz/webhook/69ba5643-617f-4036-99a4-ff8b651f89c6",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      mode: "cors",
      body: JSON.stringify({ link: link }),
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((seo) => {
      try {
        // Loại bỏ các ký tự không cần thiết
        seo = seo
          .replace(/^\[|\]$/g, "")
          .replace(/^"|"$/g, "")
          .replace(/"\}$/g, "");

        // Xử lý trùng lặp bằng cách tách và lấy phần đầu tiên
        const parts = seo.split("SEO Description:");
        if (parts.length > 1) {
          // Nếu có trùng lặp, chỉ lấy phần đầu tiên
          seo =
            parts[0] +
            "SEO Description:" +
            parts[1].split("SEO Keywords:")[0] +
            "SEO Keywords:" +
            parts[1].split("SEO Keywords:")[1].split("SEO")[0];
        }

        // Tách nội dung thành các phần riêng biệt
        const titleMatch = seo.match(
          /SEO Title:(.*?)(\n|SEO Description:|$)/i
        );
        const descMatch = seo.match(
          /SEO Description:(.*?)(\n|SEO Keywords:|$)/i
        );
        const keywordsMatch = seo.match(/SEO Keywords:(.*?)(\n|$)/i);

        // Tạo HTML format
        let formatted = "";
        if (titleMatch)
          formatted += `📝 <b>Tiêu đề SEO:</b> ${titleMatch[1].trim()}<br/><br/>`;
        if (descMatch)
          formatted += `📄 <b>Mô tả SEO:</b> ${descMatch[1].trim()}<br/><br/>`;
        if (keywordsMatch) {
          // Loại bỏ dấu "} ở cuối từ khóa
          let keywords = keywordsMatch[1].trim();
          keywords = keywords.replace(/"\}$/, "");
          formatted += `🔑 <b>Từ khóa SEO:</b> ${keywords}`;
        }

        result.innerHTML = formatted || "Không có dữ liệu trả về";
      } catch (e) {
        console.error(e);
        result.innerText = "❌ Lỗi xử lý dữ liệu: " + e.message;
      }
    })
    .catch((err) => {
      result.innerText = "❌ Lỗi kết nối: " + err.message;
    });
});

copyBtn.addEventListener("click", () => {
  const text = result.innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert("✅ Đã sao chép kết quả vào clipboard!");
  });
});