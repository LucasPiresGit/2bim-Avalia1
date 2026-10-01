// Importa a função da pasta lib
import { gerarDesenho } from '/lib/desenho.js';

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Método não permitido', { status: 405 });
    }

    let corpo;
    try {
        corpo = await request.json();
    } catch (e) {
        return new Response('Corpo ausente ou JSON inválido', { status: 400 });
    }

    const numero = corpo.numero;
    if (numero === undefined || typeof numero !== 'number' || !Number.isInteger(numero) || numero < 1 || numero > 100) {
        return new Response('Número ausente, não inteiro ou fora do intervalo (1-100)', { status: 400 });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Token ausente ou formato inválido', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (googleResponse.status !== 200) {
        return new Response('Token inválido ou expirado', { status: 401 });
    }

    const tokenInfo = await googleResponse.json();
    if (tokenInfo.aud !== env.GOOGLE_CLIENT_ID || String(tokenInfo.email_verified) !== 'true') {
        return new Response('Audience inválido ou e-mail não verificado', { status: 401 });
    }

    const emailAssinatura = tokenInfo.email;
    const svgGerado = gerarDesenho(numero, emailAssinatura);

    return new Response(svgGerado, {
        status: 200,
        headers: {
            'Content-Type': 'image/svg+xml'
        }
    });
}