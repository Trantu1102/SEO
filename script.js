const sendBtn = document.getElementById("sendBtn");
const copyBtn = document.getElementById("copyBtn");
const linkInput = document.getElementById("linkInput");
const resultDiv = document.getElementById("result"); // Đảm bảo dùng resultDiv nhất quán

sendBtn.addEventListener("click", () => {
  const link = linkInput.value.trim();
  if (!link) {
    alert("Vui lòng nhập link preview!");
    return;
  }
  resultDiv.innerHTML = "⏳ Đang xử lý..."; // Sử dụng resultDiv

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
      // Chuyển response thành JSON ngay tại đây
      return response.json();
    })
    .then(data => {
      console.log('Webhook data received:', data); // Log dữ liệu nhận được

      let seoText = '';
      let spellingText = '';

      // Kiểm tra nếu data là mảng và có ít nhất 2 phần tử
      if (Array.isArray(data) && data.length >= 2) {
        // Lấy phần SEO từ item đầu tiên (index 0)
        if (data[0] && data[0].output) {
          seoText = data[0].output;
        }
        // Lấy phần sửa chính tả từ item thứ hai (index 1)
        if (data[1] && data[1].output) {
          spellingText = data[1].output;
        }
      } else if (Array.isArray(data) && data.length === 1) {
          // Trường hợp chỉ có 1 item, thử kiểm tra xem nó là gì
           if (data[0] && data[0].output) {
             if (data[0].output.includes('SEO Title:') || data[0].output.includes('SEO Description:') || data[0].output.includes('SEO Keywords:')) {
                seoText = data[0].output;
             } else {
                spellingText = data[0].output;
             }
           }
      }


      console.log('seoText after processing:', seoText); // Log seoText
      console.log('spellingText after processing:', spellingText); // Log spellingText


      let formatted = "";

      // Xử lý và định dạng phần SEO
      if (seoText) {
          // Loại bỏ các ký tự không cần thiết nếu cần (tùy thuộc vào cách bạn format output trong n8n)
          let cleanedSeoText = seoText
             .replace(/^\[|\]$/g, "")
             .replace(/^"|"$/g, "")
             .replace(/"\}$/, "");

          const titleMatch = cleanedSeoText.match(/SEO Title:([\s\S]*?)SEO Description:/i);
          const descMatch = cleanedSeoText.match(/SEO Description:([\s\S]*?)SEO Keywords:/i);
          const keywordsMatch = cleanedSeoText.match(/SEO Keywords:([\s\S]*)/i);

          if (titleMatch && titleMatch[1]) {
            formatted += `📝 <b>Tiêu đề SEO:</b> ${titleMatch[1].trim()}<br/><br/>`;
          }
          if (descMatch && descMatch[1]) {
            formatted += `📄 <b>Mô tả SEO:</b> ${descMatch[1].trim()}<br/><br/>`;
          }
          if (keywordsMatch && keywordsMatch[1]) {
            let keywords = keywordsMatch[1].trim();
            // Loại bỏ dấu "}" ở cuối nếu có
            keywords = keywords.replace(/"\}$/, "");
            formatted += `🔑 <b>Từ khóa SEO:</b> ${keywords}`;
          }
      }


      // Xử lý và định dạng phần sửa chính tả
      if (spellingText) {
        let processedSpellingText = spellingText;
        const snippets = [];
        const regex = /\[(.*?)\]/g;
        let match;
        const windowSize = 200; // Tăng số ký tự lấy trước và sau lỗi

        while ((match = regex.exec(processedSpellingText)) !== null) {
            const fullMatch = match[0]; // Ví dụ: "[ https://...]" hoặc "[lừng lẫy]"
            const content = match[1].trim(); // Nội dung bên trong [], ví dụ: "https://..." hoặc "lừng lẫy"

            // Kiểm tra nội dung bên trong
            if (!content.startsWith('http://') && !content.startsWith('https://')) {
                // Nếu không phải link, lấy đoạn văn bản xung quanh
                const startIndex = Math.max(0, match.index - windowSize);
                const endIndex = Math.min(processedSpellingText.length, match.index + fullMatch.length + windowSize);

                let snippet = processedSpellingText.substring(startIndex, endIndex);

                // Bôi vàng cặp thẻ và nội dung trong snippet, thêm khoảng trắng sau thẻ mark
                snippet = snippet.replace(fullMatch, `<mark>${fullMatch}</mark> `); // <-- Thêm khoảng trắng ở đây

                // Thêm "..." vào đầu và cuối snippet nếu không phải là đầu/cuối văn bản gốc
                let formattedSnippet = '';
                if (startIndex > 0) {
                    formattedSnippet += '...';
                }
                formattedSnippet += snippet;
                if (endIndex < processedSpellingText.length) {
                    formattedSnippet += '...';
                }


                snippets.push(formattedSnippet);
            }
        }

        let cleanedSpellingText = '';
        if (snippets.length > 0) {
             // Nối các snippet lại với dấu phân cách
             cleanedSpellingText = snippets.join('<br/>...<br/>'); // Sử dụng ... để phân cách các đoạn

             // Thay thế các ký tự xuống dòng còn lại trong các snippet bằng <br/>
             cleanedSpellingText = cleanedSpellingText.replace(/\n/g, '<br/>');
        }


        if (cleanedSpellingText) {
          // Thêm dòng trống nếu đã có phần SEO
          if (formatted) {
              formatted += `<br/><br/>`;
          }
          formatted += `✍️ <b>Sửa chính tả:</b><br/>${cleanedSpellingText}`;
        }
      }

      console.log('Formatted output:', formatted); // Log formatted string

      resultDiv.innerHTML = formatted || "Không có dữ liệu trả về"; // Sử dụng resultDiv
    })
    .catch((err) => {
      resultDiv.innerText = "❌ Lỗi kết nối: " + err.message; // Sử dụng resultDiv
    });
});

copyBtn.addEventListener("click", () => {
  const text = resultDiv.innerText; // Sử dụng resultDiv
  navigator.clipboard.writeText(text).then(() => {
    alert("✅ Đã sao chép kết quả vào clipboard!");
  });
});
