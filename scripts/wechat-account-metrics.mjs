function dayBefore(day, amount) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - amount);
  return date.toISOString().slice(0, 10);
}

function sumMetrics(rows) {
  let reads;
  let likes;
  let readCoverage = 0;
  for (const row of rows) {
    if (row.read_count !== undefined) {
      reads = (reads ?? 0) + row.read_count;
      readCoverage++;
    }
    if (row.like_count !== undefined) likes = (likes ?? 0) + row.like_count;
  }
  return { articles: rows.length, reads, likes, read_coverage: readCoverage };
}

export function summarizeAccount(articles, trend, archiveCount, source) {
  const articleAnchor = articles.reduce((latest, article) => article.date > latest ? article.date : latest, '');
  const anchor = !source && trend?.to > (articleAnchor || '') ? trend.to : articleAnchor || trend?.to;
  const total = sumMetrics(articles);
  const metrics = { total: { ...total, articles: source ? total.articles : archiveCount }, anchor };
  if (!anchor) return metrics;

  const days = new Map();
  for (const article of articles) {
    if (!article.date) continue;
    if (!days.has(article.date)) days.set(article.date, []);
    days.get(article.date).push(article);
  }
  const daily = Array.from({ length: 30 }, (_, index) => {
    const day = dayBefore(anchor, 29 - index);
    return { date: day, ...sumMetrics(days.get(day) || []) };
  });
  const reported = !source && trend?.to === anchor ? trend : undefined;
  for (const count of [7, 30]) {
    const period = daily.slice(-count);
    const from = period[0].date;
    const rows = articles.filter(article => article.date >= from && article.date <= anchor);
    const summary = sumMetrics(rows);
    if (reported) {
      const points = reported.points.filter(point => point.date >= from && point.date <= anchor);
      if (points.length === count) {
        summary.articles = points.reduce((sum, point) => sum + (point.articles ?? 0), 0);
        summary.read_coverage = points.reduce((sum, point) => sum + (point.read_coverage ?? 0), 0);
        summary.reads = points.reduce((sum, point) => sum + (point.reads ?? 0), 0);
      }
    }
    metrics[`recent_${count}`] = { from, to: anchor, ...summary };
  }
  if (!metrics.recent_30.read_coverage && reported?.reads === undefined) return metrics;
  const recent = metrics.recent_30;
  metrics.trend = {
    from: recent.from, to: anchor, reads: reported?.reads ?? recent.reads,
    articles: reported?.articles ?? recent.articles, read_coverage: reported?.read_coverage ?? recent.read_coverage,
    points: reported?.points.length ? reported.points : daily,
  };
  return metrics;
}
