'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type DateRange = {
  from: Date;
  to: Date;
};

const supabase = createClient();

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState('resumo');
  const [period, setPeriod] = useState('month'); // day, week, month
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>(format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadFinancialData();
  }, [period, startDate, endDate]);

  const loadFinancialData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profit_loss_report')
        .select('*');
      
      // Aplicar filtros de data
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (period === 'day') {
        query = query.gte('report_date', start.toISOString())
                    .lte('report_date', end.toISOString())
                    .order('report_date', { ascending: false });
      } else if (period === 'week') {
        query = query.gte('report_week', start.toISOString())
                    .lte('report_week', end.toISOString())
                    .order('report_week', { ascending: false });
      } else {
        query = query.gte('report_month', start.toISOString())
                    .lte('report_month', end.toISOString())
                    .order('report_month', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao carregar dados financeiros:', error);
        toast.error('Erro ao carregar dados financeiros: ' + error.message);
      } else {
        setFinancialData(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatPercentage = (value: number) => {
    return `${value?.toFixed(2) || 0}%`;
  };

  const formatDate = (dateString: string, periodType: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    if (periodType === 'day') {
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } else if (periodType === 'week') {
      return `Semana de ${format(date, 'dd/MM/yyyy', { locale: ptBR })}`;
    } else {
      return format(date, 'MMMM/yyyy', { locale: ptBR });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gestão Financeira</h1>
      
      <Tabs defaultValue="resumo" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
        </TabsList>
        
        <div className="flex items-center space-x-4 mt-4 mb-2">
          <div className="flex items-center space-x-2">
            <Button 
              variant={period === 'day' ? 'default' : 'outline'} 
              onClick={() => setPeriod('day')}
              size="sm"
            >
              Diário
            </Button>
            <Button 
              variant={period === 'week' ? 'default' : 'outline'} 
              onClick={() => setPeriod('week')}
              size="sm"
            >
              Semanal
            </Button>
            <Button 
              variant={period === 'month' ? 'default' : 'outline'} 
              onClick={() => setPeriod('month')}
              size="sm"
            >
              Mensal
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startDate" className="text-xs">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </div>
        
        <TabsContent value="resumo">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <CardDescription>Período selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? 'Carregando...' : formatCurrency(financialData?.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Lucro Bruto</CardTitle>
                <CardDescription>Receita - Custos de Serviços</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? 'Carregando...' : formatCurrency(financialData?.reduce((sum: number, item: any) => sum + (item.gross_profit || 0), 0) || 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                <CardDescription>Lucro Bruto - Despesas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? 'Carregando...' : formatCurrency(financialData?.reduce((sum: number, item: any) => sum + (item.net_profit || 0), 0) || 0)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Custos e Despesas</CardTitle>
                <CardDescription>Distribuição de custos e despesas</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">% da Receita</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">Carregando...</TableCell>
                      </TableRow>
                    ) : (
                      <>
                        <TableRow>
                          <TableCell>Custos de Serviços</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(financialData?.reduce((sum: number, item: any) => sum + (item.service_costs || 0), 0) || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage((financialData?.reduce((sum: number, item: any) => sum + (item.service_costs || 0), 0) / 
                              financialData?.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) * 100) || 0)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Anúncios</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(financialData?.reduce((sum: number, item: any) => sum + (item.ads_expenses || 0), 0) || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage((financialData?.reduce((sum: number, item: any) => sum + (item.ads_expenses || 0), 0) / 
                              financialData?.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) * 100) || 0)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Funcionários</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(financialData?.reduce((sum: number, item: any) => sum + (item.employee_expenses || 0), 0) || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage((financialData?.reduce((sum: number, item: any) => sum + (item.employee_expenses || 0), 0) / 
                              financialData?.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) * 100) || 0)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Impostos</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(financialData?.reduce((sum: number, item: any) => sum + (item.tax_expenses || 0), 0) || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage((financialData?.reduce((sum: number, item: any) => sum + (item.tax_expenses || 0), 0) / 
                              financialData?.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) * 100) || 0)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Infraestrutura</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(financialData?.reduce((sum: number, item: any) => sum + (item.infrastructure_expenses || 0), 0) || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage((financialData?.reduce((sum: number, item: any) => sum + (item.infrastructure_expenses || 0), 0) / 
                              financialData?.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) * 100) || 0)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Outros</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(financialData?.reduce((sum: number, item: any) => sum + (item.other_expenses || 0), 0) || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage((financialData?.reduce((sum: number, item: any) => sum + (item.other_expenses || 0), 0) / 
                              financialData?.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) * 100) || 0)}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Margens</CardTitle>
                <CardDescription>Margens de lucro</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Margem (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">Carregando...</TableCell>
                      </TableRow>
                    ) : (
                      <>
                        <TableRow>
                          <TableCell>Receita</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(financialData?.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) || 0)}
                          </TableCell>
                          <TableCell className="text-right">100%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Lucro Bruto</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(financialData?.reduce((sum: number, item: any) => sum + (item.gross_profit || 0), 0) || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage((financialData?.reduce((sum: number, item: any) => sum + (item.gross_profit || 0), 0) / 
                              financialData?.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) * 100) || 0)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Lucro Líquido</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(financialData?.reduce((sum: number, item: any) => sum + (item.net_profit || 0), 0) || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercentage((financialData?.reduce((sum: number, item: any) => sum + (item.net_profit || 0), 0) / 
                              financialData?.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) * 100) || 0)}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="detalhes">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes Financeiros</CardTitle>
              <CardDescription>
                Detalhamento financeiro por {period === 'day' ? 'dia' : period === 'week' ? 'semana' : 'mês'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Custos de Serviços</TableHead>
                    <TableHead className="text-right">Lucro Bruto</TableHead>
                    <TableHead className="text-right">Despesas</TableHead>
                    <TableHead className="text-right">Lucro Líquido</TableHead>
                    <TableHead className="text-right">Margem (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">Carregando...</TableCell>
                    </TableRow>
                  ) : financialData?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">Nenhum dado encontrado para o período selecionado</TableCell>
                    </TableRow>
                  ) : (
                    financialData?.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          {period === 'day' 
                            ? formatDate(item.report_date, 'day')
                            : period === 'week'
                              ? formatDate(item.report_week, 'week')
                              : formatDate(item.report_month, 'month')
                          }
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.service_costs)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.gross_profit)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.total_expenses)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.net_profit)}</TableCell>
                        <TableCell className="text-right">{formatPercentage(item.net_margin_percentage)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" asChild>
          <a href="/admin/financeiro/custos">Gerenciar Custos de Serviços</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/admin/financeiro/despesas">Gerenciar Despesas</a>
        </Button>
      </div>
    </div>
  );
}
