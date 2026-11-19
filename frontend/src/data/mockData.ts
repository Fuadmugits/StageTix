import { Concert, PaymentMethod } from '../types';

export const MOCK_CONCERTS: Concert[] = [];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'qris',
    name: 'QRIS (GoPay, ShopeePay, OVO, Dana, LinkAja)',
    category: 'qris',
    icon: '⚡',
    fee: 0,
    adminFeeType: 'flat',
    instructions: [
      'Buka aplikasi e-wallet pilihan Anda (GoPay, OVO, ShopeePay, DANA, BCA Mobile).',
      'Pilih tombol "Scan QR".',
      'Arahkan kamera ke Kode QRIS di layar.',
      'Periksa detail pembayaran dan konfirmasi dengan PIN Anda.'
    ]
  },
  {
    id: 'bca_va',
    name: 'BCA Virtual Account',
    category: 'virtual_account',
    icon: '🏦',
    fee: 4500,
    adminFeeType: 'flat',
    accountNumber: '8800192837461928',
    instructions: [
      'Buka aplikasi BCA Mobile / KlikBCA / ATM BCA.',
      'Pilih m-Transfer > BCA Virtual Account.',
      'Masukkan nomor Virtual Account: 8800 1928 3746 1928.',
      'Periksa nominal pembayaran dan selesaikan transaksi dengan PIN m-BCA Anda.'
    ]
  },
  {
    id: 'mandiri_va',
    name: 'Mandiri Virtual Account',
    category: 'virtual_account',
    icon: '🏦',
    fee: 4500,
    adminFeeType: 'flat',
    accountNumber: '8889912348765432',
    instructions: [
      'Buka Livin\' by Mandiri.',
      'Pilih Bayar > Multipayment.',
      'Pilih Penyedia Jasa: StageTix / Midtrans.',
      'Masukkan Kode VA 8889 9123 4876 5432 dan bayar.'
    ]
  },
  {
    id: 'bri_va',
    name: 'BRI Virtual Account (BRIVA)',
    category: 'virtual_account',
    icon: '🏦',
    fee: 4500,
    adminFeeType: 'flat',
    accountNumber: '2621500098761234',
    instructions: [
      'Buka BRImo.',
      'Pilih Pembayaran > BRIVA.',
      'Masukkan nomor BRIVA: 2621 5000 9876 1234.',
      'Konfirmasi pembayaran dengan PIN BRImo.'
    ]
  },
  {
    id: 'credit_card',
    name: 'Kartu Kredit / Debit (Visa, Mastercard, JCB)',
    category: 'card',
    icon: '💳',
    fee: 2.9,
    adminFeeType: 'percentage',
    instructions: [
      'Masukkan nomor kartu 16 digit.',
      'Masukkan tanggal kedaluwarsa & CVV (3 digit dibelakang kartu).',
      'Klik Bayar dan masukkan 6-digit OTP SMS yang dikirim oleh bank Anda.'
    ]
  },
  {
    id: 'alfamart',
    name: 'Alfamart / Indomaret',
    category: 'retail',
    icon: '🏪',
    fee: 5000,
    adminFeeType: 'flat',
    accountNumber: 'STAGETIX-89127391',
    instructions: [
      'Tunjukkan kode pembayaran STAGETIX-89127391 ke kasir Alfamart atau Indomaret.',
      'Bayar kasir sesuai nominal persis.',
      'Simpan struk bukti pembayaran fisik.'
    ]
  }
];

