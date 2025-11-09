import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

// Lista de User-Agents para rotacionar
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

// Seleciona um User-Agent aleatório
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Delay (aguardar X milissegundos)
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  timeout?: number;
}

/**
 * Faz requisição HTTP com retry automático e proteções anti-bloqueio
 */
export async function fetchWithRetry(
  url: string,
  config: AxiosRequestConfig = {},
  retryConfig: RetryConfig = {}
): Promise<string> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    timeout = 10000,
  } = retryConfig;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Aguarda antes de tentar (exceto na primeira tentativa)
      if (attempt > 0) {
        const waitTime = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`⏳ Aguardando ${waitTime}ms antes da tentativa ${attempt + 1}...`);
        await delay(waitTime);
      }

      console.log(`🌐 Tentativa ${attempt + 1}/${maxRetries + 1}: ${url}`);

      const response = await axios.get(url, {
        ...config,
        timeout,
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          ...config.headers,
        },
      });

      // Sucesso!
      console.log(`✅ Sucesso! Status: ${response.status}`);
      return response.data;

    } catch (error) {
      lastError = error as Error;

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;

        console.error(`❌ Erro na tentativa ${attempt + 1}:`, {
          status,
          message: axiosError.message,
        });

        // Erros que NÃO devem fazer retry (cliente enviou dados errados)
        if (status && status >= 400 && status < 500 && status !== 429) {
          console.error('🚫 Erro do cliente, não vou tentar novamente');
          throw error;
        }

        // 429 = Too Many Requests → aguardar mais tempo
        if (status === 429) {
          console.warn('⚠️ Rate limit atingido, aguardando mais tempo...');
          await delay(baseDelay * 3);
        }

        // 503 = Service Unavailable → servidor temporariamente indisponível
        if (status === 503) {
          console.warn('⚠️ Serviço temporariamente indisponível');
        }
      } else {
        console.error(`❌ Erro desconhecido:`, error);
      }

      // Se foi a última tentativa, lança o erro
      if (attempt === maxRetries) {
        console.error('🔴 Todas as tentativas falharam');
        throw lastError;
      }
    }
  }

  // Nunca deve chegar aqui, mas TypeScript exige
  throw lastError || new Error('Falha desconhecida');
}
