# Form timeout and bounded-readback standard

Authenticate and pre-count before the single authorized submit. Every synthetic payload carries a unique correlation UUID and valid FormEntry envelope. The client has one bounded abort and no retry. After any timeout, poll authoritative Admin readback for that UUID over a declared bounded interval. If no entry appears, remove temporary activation, rehold forms, and require new authorization only after the transport cause is fixed.
