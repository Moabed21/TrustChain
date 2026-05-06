from app.services.funding import fund # افترضت أن ملفك اسمه funding داخل services
import asyncio
try:
    # جرب إرسال مبلغ لعنوان محفظة تملكها (على شبكة Testnet أولاً!)
    test_address = "0xYourTestWalletAddress"
    result = asyncio.run(fund(test_address))
    print(f"Done! TX: {result}")
except Exception as e:
    print(f"Error caught during test: {e}")