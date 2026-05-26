import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { applicationId, signatureDataUrl, signedAt } = body as {
      applicationId: string
      signatureDataUrl: string // base64 PNG
      signedAt: string
    }

    if (!applicationId || !signatureDataUrl) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Load application + profile
    const { data: app } = await supabase
      .from('applications')
      .select('*, users(email)')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .single()

    if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // ── Build PDF ──────────────────────────────────────────────────────────────
    const pdfDoc = await PDFDocument.create()
    const page   = pdfDoc.addPage([595, 842]) // A4 portrait
    const { width, height } = page.getSize()

    const fontBold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontReg    = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const navy       = rgb(0.102, 0.102, 0.118)  // #1A1A1E
    const red        = rgb(0.902, 0.224, 0.275)  // #E63946
    const gray       = rgb(0.45, 0.45, 0.45)
    const lightGray  = rgb(0.88, 0.88, 0.88)

    const ml = 60  // margin left
    const mr = width - 60  // margin right
    let y = height - 50

    // ── Header bar ────────────────────────────────────────────────────────────
    page.drawRectangle({ x: 0, y: height - 72, width, height: 72, color: navy })
    page.drawText('Steuer', { x: ml, y: height - 44, font: fontBold, size: 22, color: rgb(1,1,1) })
    const steuerWidth = fontBold.widthOfTextAtSize('Steuer', 22)
    page.drawText('Back', { x: ml + steuerWidth, y: height - 44, font: fontBold, size: 22, color: red })
    page.drawText('German Tax Refund Service · steuerback.com', {
      x: ml, y: height - 62, font: fontReg, size: 9, color: rgb(0.7, 0.7, 0.8),
    })

    y = height - 100

    // ── Title ─────────────────────────────────────────────────────────────────
    page.drawText('VOLLMACHT', { x: ml, y, font: fontBold, size: 20, color: navy })
    page.drawText('Power of Attorney — German Tax Return', {
      x: ml, y: y - 18, font: fontReg, size: 10, color: gray,
    })
    page.drawLine({ start: { x: ml, y: y - 30 }, end: { x: mr, y: y - 30 }, thickness: 1.5, color: red })

    y -= 50

    // ── Helper: draw a labeled field row ─────────────────────────────────────
    const field = (label: string, value: string, yPos: number, colX = ml) => {
      page.drawText(label.toUpperCase(), {
        x: colX, y: yPos + 1, font: fontBold, size: 7, color: gray,
      })
      page.drawText(value || '—', {
        x: colX, y: yPos - 11, font: fontReg, size: 10.5, color: navy,
      })
      page.drawLine({
        start: { x: colX, y: yPos - 15 },
        end: { x: colX + 220, y: yPos - 15 },
        thickness: 0.5, color: lightGray,
      })
    }

    // ── Applicant info ────────────────────────────────────────────────────────
    page.drawText('APPLICANT DETAILS', { x: ml, y, font: fontBold, size: 8, color: red })
    y -= 18

    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '—'
    const dob = profile?.date_of_birth
      ? new Date(profile.date_of_birth).toLocaleDateString('de-DE') : '—'
    const address = [profile?.address, profile?.city, profile?.country_of_residence].filter(Boolean).join(', ') || '—'

    field('Full name', fullName, y, ml)
    field('Date of birth', dob, y, ml + 250)
    y -= 40

    field('Address', address, y, ml)
    field('Nationality', profile?.nationality || '—', y, ml + 250)
    y -= 40

    field('Passport / ID', profile?.passport_number || '—', y, ml)
    field('Tax ID (Steuer-ID)', profile?.tax_id || '—', y, ml + 250)
    y -= 50

    // ── Tax year ──────────────────────────────────────────────────────────────
    page.drawRectangle({
      x: ml, y: y - 2, width: mr - ml, height: 28,
      color: rgb(0.95, 0.97, 1), borderColor: rgb(0.8, 0.87, 1), borderWidth: 1,
    })
    page.drawText(`TAX YEAR: ${app.tax_year}`, {
      x: ml + 12, y: y + 10, font: fontBold, size: 12, color: navy,
    })
    y -= 40

    // ── Authorization text ────────────────────────────────────────────────────
    page.drawText('AUTHORIZATION', { x: ml, y, font: fontBold, size: 8, color: red })
    y -= 16

    const authLines = [
      `I, ${fullName}, born on ${dob}, residing at ${address},`,
      `hereby authorize SteuerBack to represent me in all tax matters`,
      `before the German tax authorities (Finanzamt) for the tax year ${app.tax_year}.`,
      '',
      'This power of attorney includes in particular:',
      '  • Filing of annual income tax returns (Einkommensteuererklärung)',
      '  • Receipt of tax assessments (Steuerbescheide)',
      '  • Filing of objections and appeals on my behalf',
      '  • Communication with the Finanzamt in all related matters',
      '',
      'I confirm that all information provided in this application is accurate',
      'and complete to the best of my knowledge.',
    ]

    for (const line of authLines) {
      if (line === '') { y -= 8; continue }
      page.drawText(line, { x: ml, y, font: fontReg, size: 9.5, color: navy })
      y -= 14
    }

    y -= 20

    // ── Signature area ────────────────────────────────────────────────────────
    page.drawLine({ start: { x: ml, y }, end: { x: mr, y }, thickness: 0.5, color: lightGray })
    y -= 16

    const signDate = signedAt
      ? new Date(signedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

    page.drawText('Place, Date', { x: ml, y: y + 1, font: fontBold, size: 7, color: gray })
    page.drawText(`Online, ${signDate}`, { x: ml, y: y - 11, font: fontReg, size: 10.5, color: navy })
    page.drawLine({
      start: { x: ml, y: y - 15 }, end: { x: ml + 200, y: y - 15 },
      thickness: 0.5, color: lightGray,
    })

    // Embed signature image
    if (signatureDataUrl.startsWith('data:image/png;base64,')) {
      const base64 = signatureDataUrl.replace('data:image/png;base64,', '')
      const sigBytes = Buffer.from(base64, 'base64')
      const sigImage = await pdfDoc.embedPng(sigBytes)

      const sigDims = sigImage.scale(0.4)
      const sigBoxX = ml + 250
      const sigBoxY = y - 55

      page.drawRectangle({
        x: sigBoxX - 4, y: sigBoxY - 4,
        width: sigDims.width + 8, height: sigDims.height + 8,
        color: rgb(0.98, 0.98, 0.98),
        borderColor: lightGray, borderWidth: 0.5,
      })
      page.drawImage(sigImage, {
        x: sigBoxX, y: sigBoxY,
        width: sigDims.width, height: sigDims.height,
      })
      page.drawText('Signature', {
        x: sigBoxX, y: sigBoxY - 14, font: fontBold, size: 7, color: gray,
      })
      page.drawLine({
        start: { x: sigBoxX, y: sigBoxY - 18 },
        end: { x: sigBoxX + sigDims.width, y: sigBoxY - 18 },
        thickness: 0.5, color: lightGray,
      })
    }

    y -= 90

    // ── Footer ────────────────────────────────────────────────────────────────
    page.drawRectangle({ x: 0, y: 0, width, height: 44, color: rgb(0.97, 0.97, 0.97) })
    page.drawLine({ start: { x: 0, y: 44 }, end: { x: width, y: 44 }, thickness: 0.5, color: lightGray })
    page.drawText('SteuerBack · German Tax Refunds · steuerback.com · support@steuerback.com', {
      x: ml, y: 17, font: fontReg, size: 8, color: gray,
    })
    page.drawText('Confidential — For tax submission purposes only', {
      x: ml, y: 6, font: fontReg, size: 7, color: rgb(0.7, 0.7, 0.7),
    })
    page.drawText(`Page 1 of 1`, {
      x: mr - 40, y: 11, font: fontReg, size: 8, color: gray,
    })

    const pdfBytes = await pdfDoc.save()

    // ── Upload to Supabase Storage ────────────────────────────────────────────
    const fileName  = `vollmacht_${app.tax_year}_${applicationId}.pdf`
    const storagePath = `${user.id}/${applicationId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) throw uploadError

    // ── Upsert document record ────────────────────────────────────────────────
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('application_id', applicationId)
      .eq('document_type', 'power_of_attorney')
      .single()

    if (existing) {
      await supabase.from('documents').update({
        file_name: fileName,
        file_path: storagePath,
        review_status: 'pending' as const,
        admin_note: null,
      }).eq('id', existing.id)
    } else {
      await supabase.from('documents').insert({
        application_id: applicationId,
        document_type: 'power_of_attorney',
        file_name: fileName,
        file_path: storagePath,
        file_size: pdfBytes.length,
        mime_type: 'application/pdf',
        review_status: 'pending' as const,
      })
    }

    return NextResponse.json({ success: true, path: storagePath })

  } catch (err) {
    console.error('[sign-vollmacht] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
