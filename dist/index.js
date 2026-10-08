import { defineTool } from '@deepseek-ai/dsh-tools';
export const name = 'news-plugin';
export const inject = ['tools'];
export function apply(ctx) {
    ctx.tools.register(defineTool({
        name: 'get_news',
        description: '获取今日全国新闻（60秒读懂世界），返回当日新闻列表。',
        parameters: {
            limit: { type: 'integer', description: '返回条数，默认15。' },
        },
        output: {
            schema: {
                type: 'object',
                properties: {
                    news: { type: 'string', required: true, description: '新闻列表' },
                    count: { type: 'integer', required: true, description: '总条数' },
                },
                additionalProperties: false,
            },
            render: (_args, value) => [{ type: 'text', text: value.news }],
        },
        async execute(args) {
            const limit = args.limit ?? 15;
            try {
                const r = await fetch('https://60s.viki.moe/v2/60s', { signal: AbortSignal.timeout(10000) });
                const j = await r.json();
                const date = j.data?.date ?? '';
                const news = j.data?.news ?? [];
                const items = news.slice(0, limit);
                let result = date + ' 新闻简报\n';
                items.forEach((t, i) => { result += (i + 1) + '. ' + t + '\n'; });
                return { news: result.trim(), count: items.length };
            } catch (e) {
                return { news: '新闻获取失败: ' + e.message, count: 0 };
            }
        },
    }));
    console.log('[news-plugin] registered "get_news" ok');
}
