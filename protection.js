setInterval(function () {
  const startTime = +new Date();
  // تفعيل الديبوجر لإيقاف المتصفح
  debugger;
  const endTime = +new Date();
  
  // إذا استغرق الأمر أكثر من 100 مللي ثانية، فهذا يعني أن المتصفح توقف بسبب فتح الـ Inspect
  if (endTime - startTime > 100) {
    // تدمير الصفحة: مسح المحتوى تماماً واستبداله برسالة تحذيرية
    document.body.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background:#111; color:#ff4d4d; font-size:24px; font-weight:bold;">
        Accès refusé ! Les outils de développement sont interdits.
      </div>
    `;
    
    // أو يمكنك إعادة توجيهه لصفحة أخرى مثل جوجل:
    // window.location.href = "https://www.google.com";
  }
}, 200);
