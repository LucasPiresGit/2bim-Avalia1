// Função chamada automaticamente pelo Google após o login bem-sucedido
async function handleCredentialResponse(response) {
    const token = response.credential; // Este é o id_token
    const numeroInput = document.getElementById('numero').value;
    const resultadoDiv = document.getElementById('resultado');

    resultadoDiv.innerHTML = 'Processando...';

try {
        const res = await fetch('/api/desenho', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ numero: Number(numeroInput) })
        });

        const btnBaixar = document.getElementById('btnBaixar');

        if (res.status === 200) {
            const svg = await res.text();
            resultadoDiv.innerHTML = svg;
            btnBaixar.style.display = 'block';
            btnBaixar.onclick = () => {
                const blob = new Blob([svg], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = 'exemplo.svg';
                
                document.body.appendChild(link);
                link.click();
                
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            };
            
        } else {
            btnBaixar.style.display = 'none';
            
            if (res.status === 400) {
                resultadoDiv.innerHTML = '<p style="color: red;">Erro 400: Dados inválidos. Verifique se o número está entre 1 e 100.</p>';
            } else if (res.status === 401) {
                resultadoDiv.innerHTML = '<p style="color: red;">Erro 401: Não autorizado. Falha na validação do login.</p>';
            } else {
                resultadoDiv.innerHTML = `<p style="color: red;">Erro ${res.status}: Operação não permitida.</p>`;
            }
        }
    } catch (error) {
        document.getElementById('btnBaixar').style.display = 'none';
        resultadoDiv.innerHTML = '<p style="color: red;">Erro de comunicação com o servidor.</p>';
    }
}