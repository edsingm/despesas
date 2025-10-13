import { Request, Response } from 'express';
import { Receita } from '../models/Receita.js';
import { Banco } from '../models/Banco.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { parseLocalDate } from '../utils/dateUtils.js';

export class ReceitaController {
  /**
   * Criar nova receita
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { 
        categoriaId, 
        bancoId, 
        descricao, 
        valor, 
        data, 
        recorrente, 
        tipoRecorrencia, 
        observacoes 
      } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Processar arquivo de comprovante se enviado
      let comprovanteUrl = null;
      if (req.file) {
        const fileName = `receita_${Date.now()}_${req.file.originalname}`;
        const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', fileName);
        
        await fs.writeFile(filePath, req.file.buffer);
        comprovanteUrl = `/uploads/${fileName}`;
      }

      console.log('[ReceitaController] Data recebida do frontend:', data);
      const parsedDate = parseLocalDate(data);
      console.log('[ReceitaController] Data após parseLocalDate:', parsedDate);
      console.log('[ReceitaController] Data ISO:', parsedDate.toISOString());
      console.log('[ReceitaController] Data local string:', parsedDate.toLocaleString('pt-BR'));

      const receita = new Receita({
        userId,
        categoriaId,
        bancoId,
        descricao,
        valor,
        data: parsedDate,
        recorrente,
        tipoRecorrencia,
        observacoes,
        comprovante: comprovanteUrl
      });

      await receita.save();
      console.log('[ReceitaController] Receita salva, data no DB:', receita.data);

      // Atualizar saldo do banco
      if (bancoId) {
        await Banco.findByIdAndUpdate(
          bancoId,
          { $inc: { saldoAtual: valor } }
        );
      }

      // Buscar receita com dados populados
      const receitaCompleta = await Receita.findById(receita._id)
        .populate('categoriaId', 'nome cor')
        .populate('bancoId', 'nome tipo');

      res.status(201).json({
        success: true,
        message: 'Receita criada com sucesso',
        data: receitaCompleta
      });
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: Object.values(error.errors).map(err => err.message)
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Listar receitas do usuário
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { 
        categoriaId, 
        bancoId, 
        mes, 
        ano, 
        recorrente,
        page = 1, 
        limit = 10, 
        sort = 'desc', 
        sortBy = 'data' 
      } = req.query;
 
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Construir filtros
      const filters: any = { userId: new mongoose.Types.ObjectId(userId) };
      
      if (categoriaId) {
        filters.categoriaId = new mongoose.Types.ObjectId(categoriaId as string);
      }
      
      if (bancoId) {
        filters.bancoId = new mongoose.Types.ObjectId(bancoId as string);
      }
      
      if (recorrente !== undefined) {
        filters.recorrente = recorrente === 'true';
      }
      
      // Filtro por mês e ano
      if (mes && ano) {
        const mesNum = parseInt(mes as string);
        const anoNum = parseInt(ano as string);
        
        // Primeiro dia do mês
        const dataInicio = new Date(anoNum, mesNum - 1, 1);
        // Último dia do mês
        const dataFim = new Date(anoNum, mesNum, 0, 23, 59, 59, 999);
        
        filters.data = {
          $gte: dataInicio,
          $lte: dataFim
        };
      } else if (mes || ano) {
        // Se apenas um dos filtros foi fornecido
        if (ano) {
          const anoNum = parseInt(ano as string);
          const dataInicio = new Date(anoNum, 0, 1); // 1º de janeiro
          const dataFim = new Date(anoNum, 11, 31, 23, 59, 59, 999); // 31 de dezembro
          
          filters.data = {
            $gte: dataInicio,
            $lte: dataFim
          };
        }
        // Se apenas mês foi fornecido, ignoramos (precisa do ano também)
      }



      // Configurar paginação
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Configurar ordenação
      const sortOrder = sort === 'asc' ? 1 : -1;
      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder;

      // Buscar receitas e calcular total filtrado
      const [receitas, total, totalFiltrado] = await Promise.all([
        Receita.find(filters)
          .populate('categoriaId', 'nome cor')
          .populate('bancoId', 'nome tipo')
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Receita.countDocuments(filters),
        Receita.aggregate([
          { $match: filters },
          { $group: { _id: null, total: { $sum: '$valor' } } }
        ])
      ]);

      const totalValorFiltrado = totalFiltrado.length > 0 ? totalFiltrado[0].total : 0;

        res.status(200).json({
        success: true,
        data: {
          receitas,
          totalFiltrado: totalValorFiltrado,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao listar receitas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter receita por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const receita = await Receita.findOne({ _id: id, userId })
        .populate('categoriaId', 'nome cor')
        .populate('bancoId', 'nome tipo');

      if (!receita) {
        res.status(404).json({
          success: false,
          message: 'Receita não encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: receita
      });
    } catch (error) {
      console.error('Erro ao obter receita:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar receita
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { 
        categoriaId, 
        bancoId, 
        descricao, 
        valor, 
        data, 
        recorrente, 
        tipoRecorrencia, 
        observacoes 
      } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Buscar receita atual para calcular diferença de valor
      const receitaAtual = await Receita.findOne({ _id: id, userId });
      if (!receitaAtual) {
        res.status(404).json({
          success: false,
          message: 'Receita não encontrada'
        });
        return;
      }

      // Processar novo arquivo de comprovante se enviado
      let comprovanteUrl = receitaAtual.comprovante;
      if (req.file) {
        // Deletar arquivo anterior se existir
        if (receitaAtual.comprovante) {
          const oldFilePath = path.join(process.cwd(), receitaAtual.comprovante);
          try {
            await fs.unlink(oldFilePath);
          } catch (error) {
            console.warn('Erro ao deletar arquivo anterior:', error);
          }
        }

        const fileName = `receita_${Date.now()}_${req.file.originalname}`;
        const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', fileName);
        
        await fs.writeFile(filePath, req.file.buffer);
        comprovanteUrl = `/uploads/${fileName}`;
      }

      const updateData: any = {
        ...(categoriaId && { categoriaId }),
        ...(bancoId && { bancoId }),
        ...(descricao && { descricao }),
        ...(valor !== undefined && { valor }),
        ...(data && { data: parseLocalDate(data) }),
        ...(recorrente !== undefined && { recorrente }),
        ...(tipoRecorrencia && { tipoRecorrencia }),
        ...(observacoes !== undefined && { observacoes }),
        ...(comprovanteUrl && { comprovante: comprovanteUrl })
      };

      const receita = await Receita.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { 
          new: true,
          runValidators: true
        }
      ).populate('categoriaId', 'nome cor')
       .populate('bancoId', 'nome tipo');

      if (!receita) {
        res.status(404).json({
          success: false,
          message: 'Receita não encontrada'
        });
        return;
      }

      // Atualizar saldo do banco se valor ou banco mudaram
      if (valor !== undefined || bancoId) {
        const valorAnterior = receitaAtual.valor;
        const bancoAnterior = receitaAtual.bancoId;
        const novoValor = valor !== undefined ? valor : receitaAtual.valor;
        const novoBanco = bancoId || receitaAtual.bancoId;

        // Se mudou de banco
        if (bancoId && bancoAnterior && bancoId !== bancoAnterior.toString()) {
          // Remover do banco anterior
          await Banco.findByIdAndUpdate(
            bancoAnterior,
            { $inc: { saldoAtual: -valorAnterior } }
          );
          // Adicionar ao novo banco
          await Banco.findByIdAndUpdate(
            novoBanco,
            { $inc: { saldoAtual: novoValor } }
          );
        } else if (novoBanco) {
          // Mesmo banco, ajustar diferença
          const diferenca = novoValor - valorAnterior;
          await Banco.findByIdAndUpdate(
            novoBanco,
            { $inc: { saldoAtual: diferenca } }
          );
        }
      }

      res.status(200).json({
        success: true,
        message: 'Receita atualizada com sucesso',
        data: receita
      });
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: Object.values(error.errors).map(err => err.message)
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Deletar receita
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const receita = await Receita.findOne({ _id: id, userId });
      if (!receita) {
        res.status(404).json({
          success: false,
          message: 'Receita não encontrada'
        });
        return;
      }

      // Deletar arquivo de comprovante se existir
      if (receita.comprovante) {
        const filePath = path.join(process.cwd(), receita.comprovante);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.warn('Erro ao deletar arquivo:', error);
        }
      }

      // Atualizar saldo do banco
      if (receita.bancoId) {
        await Banco.findByIdAndUpdate(
          receita.bancoId,
          { $inc: { saldoAtual: -receita.valor } }
        );
      }

      await Receita.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Receita deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter estatísticas de receitas
   */
  static async getEstatisticas(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { mes, ano } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      let filtroData = {};
      if (mes && ano) {
        const mesNum = parseInt(mes as string);
        const anoNum = parseInt(ano as string);
        const dataInicio = new Date(anoNum, mesNum - 1, 1);
        const dataFim = new Date(anoNum, mesNum, 0);
        
        filtroData = {
          data: {
            $gte: dataInicio,
            $lte: dataFim
          }
        };
      }

      const estatisticas = await Receita.aggregate([
        { 
          $match: { 
            userId: new mongoose.Types.ObjectId(userId),
            ...filtroData
          } 
        },
        {
          $group: {
            _id: null,
            totalReceitas: { $sum: 1 },
            valorTotal: { $sum: '$valor' },
            valorMedio: { $avg: '$valor' },
            maiorReceita: { $max: '$valor' },
            menorReceita: { $min: '$valor' }
          }
        }
      ]);

      // Receitas por categoria
      const receitasPorCategoria = await Receita.aggregate([
        { 
          $match: { 
            userId: new mongoose.Types.ObjectId(userId),
            ...filtroData
          } 
        },
        {
          $lookup: {
            from: 'categorias',
            localField: 'categoriaId',
            foreignField: '_id',
            as: 'categoria'
          }
        },
        { $unwind: '$categoria' },
        {
          $group: {
            _id: '$categoriaId',
            nome: { $first: '$categoria.nome' },
            cor: { $first: '$categoria.cor' },
            total: { $sum: '$valor' },
            quantidade: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } }
      ]);

      // Receitas por banco
      const receitasPorBanco = await Receita.aggregate([
        { 
          $match: { 
            userId: new mongoose.Types.ObjectId(userId),
            bancoId: { $ne: null },
            ...filtroData
          } 
        },
        {
          $lookup: {
            from: 'bancos',
            localField: 'bancoId',
            foreignField: '_id',
            as: 'banco'
          }
        },
        { $unwind: '$banco' },
        {
          $group: {
            _id: '$bancoId',
            nome: { $first: '$banco.nome' },
            tipo: { $first: '$banco.tipo' },
            total: { $sum: '$valor' },
            quantidade: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } }
      ]);

      // Evolução mensal (últimos 12 meses)
      const dataLimite = new Date();
      dataLimite.setMonth(dataLimite.getMonth() - 11);
      dataLimite.setDate(1);

      const evolucaoMensal = await Receita.aggregate([
        { 
          $match: { 
            userId: new mongoose.Types.ObjectId(userId),
            data: { $gte: dataLimite }
          } 
        },
        {
          $group: {
            _id: {
              ano: { $year: '$data' },
              mes: { $month: '$data' }
            },
            total: { $sum: '$valor' },
            quantidade: { $sum: 1 }
          }
        },
        { $sort: { '_id.ano': 1, '_id.mes': 1 } }
      ]);

      res.status(200).json({
        success: true,
        data: {
          resumo: estatisticas[0] || {
            totalReceitas: 0,
            valorTotal: 0,
            valorMedio: 0,
            maiorReceita: 0,
            menorReceita: 0
          },
          receitasPorCategoria,
          receitasPorBanco,
          evolucaoMensal
        }
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter receitas recorrentes próximas ao vencimento
   */
  static async getRecorrentes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { dias = 7 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const hoje = new Date();
      const limiteDias = parseInt(dias as string);
      const dataLimite = new Date(hoje.getTime() + (limiteDias * 24 * 60 * 60 * 1000));

      const receitasRecorrentes = await Receita.find({
        userId,
        recorrente: true
      }).populate('categoriaId', 'nome cor')
        .populate('bancoId', 'nome tipo')
        .sort({ data: 1 });

      // Calcular próximas ocorrências
      const proximasReceitas = [];
      
      for (const receita of receitasRecorrentes) {
        const ultimaData = new Date(receita.data);
        let proximaData = new Date(ultimaData);

        // Calcular próxima data baseada no tipo de recorrência
        switch (receita.tipoRecorrencia) {
          case 'diaria':
            proximaData.setDate(proximaData.getDate() + 1);
            break;
          case 'semanal':
            proximaData.setDate(proximaData.getDate() + 7);
            break;
          case 'mensal':
            proximaData.setMonth(proximaData.getMonth() + 1);
            break;
          case 'anual':
            proximaData.setFullYear(proximaData.getFullYear() + 1);
            break;
        }

        // Ajustar para próxima ocorrência se já passou
        while (proximaData <= hoje) {
          switch (receita.tipoRecorrencia) {
            case 'diaria':
              proximaData.setDate(proximaData.getDate() + 1);
              break;
            case 'semanal':
              proximaData.setDate(proximaData.getDate() + 7);
              break;
            case 'mensal':
              proximaData.setMonth(proximaData.getMonth() + 1);
              break;
            case 'anual':
              proximaData.setFullYear(proximaData.getFullYear() + 1);
              break;
          }
        }

        if (proximaData <= dataLimite) {
          proximasReceitas.push({
            ...receita.toObject(),
            proximaData,
            diasRestantes: Math.ceil((proximaData.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000))
          });
        }
      }

      // Ordenar por data
      proximasReceitas.sort((a, b) => 
        a.proximaData.getTime() - b.proximaData.getTime()
      );

      res.status(200).json({
        success: true,
        data: proximasReceitas
      });
    } catch (error) {
      console.error('Erro ao obter receitas recorrentes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}