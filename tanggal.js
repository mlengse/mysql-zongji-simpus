const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const myDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum&#39;at', 'Sabtu'];

module.exports = input => {
  let date = new Date(input);

  let tanggal = date.getDate();
  
  let bulan = months[date.getMonth()];
  
  let hari = myDays[date.getDay()];
  
  let yy = date.getYear();
  
  let tahun = (yy < 1000) ? yy + 1900 : yy;

  return {
    hari,
    tanggal,
    bulan,
    tahun
  }
}
