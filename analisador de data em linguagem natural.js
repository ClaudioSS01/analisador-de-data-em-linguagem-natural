 function parseNaturalDate(input) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Reset time to start of day
    let data = null;

    // Meses por extenso
    const mesPorExtenso = {
        "janeiro": 0, "fevereiro": 1, "março": 2, "abril": 3, "maio": 4, "junho": 5,
        "julho": 6, "agosto": 7, "setembro": 8, "outubro": 9, "novembro": 10, "dezembro": 11
    };

    // Números por extenso
    const numeroPorExtenso = {
        "um": 1, "dois": 2, "três": 3, "quatro": 4, "cinco": 5,
        "seis": 6, "sete": 7, "oito": 8, "nove": 9, "dez": 10,
        "onze": 11, "doze": 12, "treze": 13, "quatorze": 14,
        "quinze": 15, "dezesseis": 16, "dezessete": 17,
        "dezoito": 18, "dezenove": 19, "vinte": 20, "vinte e um": 21, "vinte e dois": 22,
        "vinte e três": 23, "vinte e quatro": 24, "vinte e cinco": 25, "vinte e seis": 26, 
        "vinte e sete": 27, "vinte e oito": 28, "vinte e nove": 29, "trinta": 30, "trinta e um": 31
    };

    // Dias da semana por extenso
    const diaDaSemanaPorExtenso = {
        "domingo": 0, "segunda-feira": 1, "segunda": 1, "terça-feira": 2, "terça": 2,
        "quarta-feira": 3, "quarta": 3, "quinta-feira": 4, "quinta": 4,
        "sexta-feira": 5, "sexta": 5, "sábado": 6, "sabado": 6
    };

    input = input.toLowerCase().trim();

    // Caso para "hoje"
    if (input === "hoje") {
        return formatDate(hoje, hoje);
    }

    // Caso para data no formato "20 de maio", "20/05", "20/5", "20/05/2025"
    // Agora também lida com "dia 20 de maio"
    const regexData = /^(dia\s+)?(\d{1,2})(\/|\s+de\s+)(\d{1,2}|[a-záàãâéèêíïóôõöúç]+)(\/(\d{4}))?$/;
    const match = input.match(regexData);
    if (match) {
        const dia = parseInt(match[2]);
        const mesInput = match[4];
        let mes = mesPorExtenso[mesInput];
        if (mes === undefined) {
            mes = parseInt(mesInput) - 1; // Se não for mês por extenso, converte para número (0-11)
        }
        const ano = match[6] ? parseInt(match[6]) : hoje.getFullYear();

        data = new Date(ano, mes, dia);
        data.setHours(0, 0, 0, 0);

        // Se a data for hoje, retorna com isPresent: true
        if (data.getTime() === hoje.getTime()) {
            return formatDate(data, hoje);
        }

        // Ajustar para o próximo ano se a data está no passado
        if (data < hoje && !match[6]) data.setFullYear(ano + 1);

        return formatDate(data, hoje);
    }

    // Checar por dias da semana
    const regexDiaSemana = /^(próxima?\s+)?(segunda|terça|quarta|quinta|sexta|sábado|sabado|domingo)(-feira)?$/;
    const matchDiaSemana = input.match(regexDiaSemana);
    if (matchDiaSemana) {
        const diaSemana = matchDiaSemana[2] + (matchDiaSemana[3] || "");
        const diaSemanaAlvo = diaDaSemanaPorExtenso[diaSemana];
        data = new Date(hoje);
        const diaAtual = hoje.getDay();
        let diasAteProximo = (diaSemanaAlvo - diaAtual + 7) % 7;
        if (diasAteProximo === 0 && matchDiaSemana[1]) {
            diasAteProximo = 7; // Se for "próxima" e o dia for hoje, vai para a próxima semana
        } else if (diasAteProximo === 0) {
            diasAteProximo = 7; // Se for apenas o dia da semana e for hoje, vai para a próxima semana
        }
        data.setDate(hoje.getDate() + diasAteProximo);
        return formatDate(data, hoje);
    }

    switch (true) {
        case input === "amanhã":
            data = new Date(hoje);
            data.setDate(hoje.getDate() + 1);
            break;

        case input === "ontem":
            data = new Date(hoje);
            data.setDate(hoje.getDate() - 1);
            return formatDate(data, hoje);

        case input === "depois de amanhã":
            data = new Date(hoje);
            data.setDate(hoje.getDate() + 2);
            break;

        case input.startsWith("dia "):
            const restoDaFrase = input.substring(4).trim();
            const regexDiaMesAno = /^(\d{1,2})(\s+de\s+)([a-záàãâéèêíïóôõöúç]+)(\s+de\s+(\d{4}))?$/;
            const matchDiaMesAno = restoDaFrase.match(regexDiaMesAno);
            
            if (matchDiaMesAno) {
                const dia = parseInt(matchDiaMesAno[1]);
                const mes = mesPorExtenso[matchDiaMesAno[3]];
                const ano = matchDiaMesAno[5] ? parseInt(matchDiaMesAno[5]) : hoje.getFullYear();
                
                data = new Date(ano, mes, dia);
                data.setHours(0, 0, 0, 0);
                
                // Se a data for hoje, retorna com isPresent: true
                if (data.getTime() === hoje.getTime()) {
                    return formatDate(data, hoje);
                }
                
                if (data < hoje && !matchDiaMesAno[5]) data.setFullYear(ano + 1);
            } else {
                const diaTextual = restoDaFrase;
                const diaNumerico = isNaN(diaTextual) ? numeroPorExtenso[diaTextual] : parseInt(diaTextual);
                if (diaNumerico) {
                    data = new Date(hoje);
                    if (diaNumerico <= hoje.getDate()) data.setMonth(data.getMonth() + 1);
                    data.setDate(diaNumerico);
                }
            }
            break;

        case input in numeroPorExtenso:
            const diaExtenso = numeroPorExtenso[input];
            data = new Date(hoje);
            if (diaExtenso <= hoje.getDate()) data.setMonth(data.getMonth() + 1);
            data.setDate(diaExtenso);
            break;

        case input.startsWith("daqui a"):
            const palavras = input.split(" ");
            const quantidade = isNaN(palavras[2]) ? numeroPorExtenso[palavras[2]] : parseInt(palavras[2]);
            if (quantidade) {
                data = new Date(hoje);
                if (palavras[3] === "dias" || palavras[3] === "dia") {
                    data.setDate(hoje.getDate() + quantidade);
                } else if (palavras[3] === "mês" || palavras[3] === "meses") {
                    data.setMonth(hoje.getMonth() + quantidade);
                } else if (palavras[3] === "ano" || palavras[3] === "anos") {
                    data.setFullYear(hoje.getFullYear() + quantidade);
                }
            }
            break;

        case input.match(/^(\d{1,2})\/(\d{1,2})(\/(\d{4}))?$/):
            const matchData = input.match(/^(\d{1,2})\/(\d{1,2})(\/(\d{4}))?$/);
            const diaData = parseInt(matchData[1]);
            const mesData = parseInt(matchData[2]) - 1;
            const anoData = matchData[4] ? parseInt(matchData[4]) : hoje.getFullYear();
            data = new Date(anoData, mesData, diaData);
            data.setHours(0, 0, 0, 0);
            
            // Se a data for hoje, retorna com isPresent: true
            if (data.getTime() === hoje.getTime()) {
                return formatDate(data, hoje);
            }
            
            if (data < hoje && !matchData[4]) {
                data.setFullYear(anoData + 1);
            }
            break;

        default:
            return "Data inválida";
    }

    return formatDate(data, hoje);
}

function formatDate(data, hoje) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const hojeFormatado = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
    
    if (data.getTime() === hoje.getTime()) {
        return { date: `${dia}/${mes}/${ano}`, today: hojeFormatado, isPresent: true };
    } else {
        return { date: `${dia}/${mes}/${ano}`, today: hojeFormatado, isFuture: data > hoje };
    }
}


//============================


console.log(parseNaturalDate("próxima segunda-feira"));
console.log(parseNaturalDate("amanhã"));
console.log(parseNaturalDate("terça"));
console.log(parseNaturalDate("ontem"));
console.log(parseNaturalDate("20 de maio"));
console.log(parseNaturalDate("20/05/2025"));
console.log(parseNaturalDate("20/12"));
console.log(parseNaturalDate("15/01"));
console.log(parseNaturalDate("15 de outubro"));
console.log(parseNaturalDate("dia 15 de outubro"));
console.log(parseNaturalDate("dia 20"));
console.log(parseNaturalDate("dia 15 de outubro de 2026"));
const hoje = new Date();
const diaHoje = hoje.getDate();
const mesHoje = hoje.getMonth() + 1;
const anoHoje = hoje.getFullYear();
const mesHojeExtenso = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][mesHoje - 1];

console.log(parseNaturalDate("hoje"));
console.log(parseNaturalDate(`${diaHoje}/${mesHoje}`));
console.log(parseNaturalDate(`${diaHoje}/${mesHoje}/${anoHoje}`));
console.log(parseNaturalDate(`dia ${diaHoje} de ${mesHojeExtenso}`));
console.log(parseNaturalDate(`${diaHoje} de ${mesHojeExtenso}`));
console.log(parseNaturalDate(`dia ${diaHoje}/${mesHoje}`));
console.log(parseNaturalDate("próxima segunda-feira"));
console.log(parseNaturalDate("amanhã"));
console.log(parseNaturalDate("terça"));
console.log(parseNaturalDate("ontem"));
console.log(parseNaturalDate("20 de maio"));
console.log(parseNaturalDate("20/05/2025"));
console.log(parseNaturalDate("20/12"));
console.log(parseNaturalDate("15/01"));
