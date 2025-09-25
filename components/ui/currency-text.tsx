type CurrencyProps = {
  amount: number;
  currency?: string; // default to $
};

export default function CurrencyText({ amount, currency = '$' }: CurrencyProps) {
  // Format with Intl
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === '$' ? 'USD' : 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);

  // Split whole number and decimal part
  const [main, decimal] = formatted.split('.');

  return (
    <h1 className="text-inverse text-3xl font-medium">
      {main}.<span className="text-muted-foreground">{decimal}</span>
    </h1>
  );
}
