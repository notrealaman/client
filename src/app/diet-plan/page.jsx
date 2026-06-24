'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { diet as dietApi, calories as caloriesApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { UtensilsCrossed, Plus, X, Loader2, Trash2, Apple, Target, Flame, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

function DietPlanContent() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calorieLog, setCalorieLog] = useState(null);
  const [calorieInput, setCalorieInput] = useState({ totalCalories: '', protein: '', carbs: '', fat: '' });
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(null);
  const [showAddItem, setShowAddItem] = useState(null);
  const [newPlan, setNewPlan] = useState({ name: '', startDate: '', endDate: '', dailyCalorieGoal: '', notes: '' });
  const [newMeal, setNewMeal] = useState({ name: '', timeOfDay: '' });
  const [newItem, setNewItem] = useState({ name: '', quantity: '', calories: '', protein: '', carbs: '', fat: '' });
  const [saving, setSaving] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [aiForm, setAiForm] = useState({ dietType: 'NON_VEGETARIAN', dailyCalorieGoal: '' });
  const [generating, setGenerating] = useState(false);

  const isTrainer = user?.role === 'TRAINER' || user?.role === 'BOTH';

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [plansData, logs] = await Promise.all([dietApi.list('mine'), caloriesApi.list({ limit: 1 })]);
      setPlans(plansData);
      if (plansData.length > 0) setSelectedPlanId(plansData[0].id);
      setCalorieLog(logs[0] || null);
      if (logs[0]) setCalorieInput({ totalCalories: logs[0].totalCalories.toString(), protein: logs[0].protein?.toString() || '', carbs: logs[0].carbs?.toString() || '', fat: logs[0].fat?.toString() || '' });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const createPlan = async (e) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.startDate) return toast.error('Name and start date required');
    setSaving(true);
    try {
      const plan = await dietApi.create({ ...newPlan, dailyCalorieGoal: parseInt(newPlan.dailyCalorieGoal) || null });
      toast.success('Diet plan created');
      setShowCreatePlan(false);
      setNewPlan({ name: '', startDate: '', endDate: '', dailyCalorieGoal: '', notes: '' });
      const plansData = await dietApi.list('mine');
      setPlans(plansData);
      setSelectedPlanId(plan.id);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const addMeal = async (planId) => {
    if (!newMeal.name) return toast.error('Meal name required');
    setSaving(true);
    try {
      await dietApi.addMeal(planId, newMeal);
      setShowAddMeal(null);
      setNewMeal({ name: '', timeOfDay: '' });
      toast.success('Meal added');
      const plansData = await dietApi.list('mine');
      setPlans(plansData);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const addItem = async (mealId) => {
    if (!newItem.name || !newItem.quantity) return toast.error('Name and quantity required');
    setSaving(true);
    try {
      await dietApi.addItem(mealId, { ...newItem, calories: parseInt(newItem.calories) || 0, protein: newItem.protein ? parseFloat(newItem.protein) : null, carbs: newItem.carbs ? parseFloat(newItem.carbs) : null, fat: newItem.fat ? parseFloat(newItem.fat) : null });
      setShowAddItem(null);
      setNewItem({ name: '', quantity: '', calories: '', protein: '', carbs: '', fat: '' });
      toast.success('Item added');
      const plansData = await dietApi.list('mine');
      setPlans(plansData);
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const deleteItem = async (itemId) => {
    try { await dietApi.deleteItem(itemId); toast.success('Item removed'); const plansData = await dietApi.list('mine'); setPlans(plansData); }
    catch (err) { toast.error(err.message); }
  };

  const logCalories = async (e) => {
    e.preventDefault();
    if (!calorieInput.totalCalories) return toast.error('Calories required');
    try {
      await caloriesApi.log({
        date: new Date().toISOString(),
        totalCalories: parseInt(calorieInput.totalCalories),
        protein: calorieInput.protein ? parseFloat(calorieInput.protein) : null,
        carbs: calorieInput.carbs ? parseFloat(calorieInput.carbs) : null,
        fat: calorieInput.fat ? parseFloat(calorieInput.fat) : null,
      });
      toast.success('Calorie log updated');
    } catch (err) { toast.error(err.message); }
  };

  const deletePlan = async (id) => {
    try { await dietApi.delete(id); toast.success('Plan deleted'); setPlans(plans.filter(p => p.id !== id)); if (selectedPlanId === id) setSelectedPlanId(null); }
    catch (err) { toast.error(err.message); }
  };

  const totalCaloriesToday = selectedPlan?.meals?.reduce((sum, m) => sum + (m.totalCalories || 0), 0) || 0;
  const calorieGoal = selectedPlan?.dailyCalorieGoal || 2000;
  const caloriePct = Math.min(100, Math.round((totalCaloriesToday / calorieGoal) * 100));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Diet & <span className="text-gradient">Calories</span></h1>
          <p className="text-dark-400 mt-1">Plan your meals and track your daily intake</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAIGenerate(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl hover:from-purple-500 transition-all shadow-lg shadow-purple-500/20">
            <Sparkles className="w-4 h-4" /> AI Generate
          </button>
          <button onClick={() => setShowCreatePlan(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-500 transition-all shadow-lg shadow-primary-500/20">
            <Plus className="w-4 h-4" /> New Plan
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {plans.length === 0 ? (
            <div className="text-center py-16 bg-dark-800/30 border border-dark-700/30 rounded-2xl">
              <UtensilsCrossed className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400">No diet plans yet. Create your first plan!</p>
            </div>
          ) : (
            <div className="bg-dark-800/30 border border-dark-700/30 rounded-2xl overflow-hidden">
              <div className="flex overflow-x-auto border-b border-dark-700/30">
                {plans.map(plan => (
                  <button key={plan.id} onClick={() => setSelectedPlanId(plan.id)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${selectedPlanId === plan.id ? 'text-primary-400 border-b-2 border-primary-400 bg-primary-500/5' : 'text-dark-400 hover:text-dark-200'}`}>{plan.name}</button>
                ))}
              </div>

              {selectedPlan && (
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedPlan.name}</h3>
                      <p className="text-xs text-dark-400 mt-1">
                        {new Date(selectedPlan.startDate).toLocaleDateString()}
                        {selectedPlan.endDate && ` - ${new Date(selectedPlan.endDate).toLocaleDateString()}`}
                        {selectedPlan.dailyCalorieGoal && ` | Goal: ${selectedPlan.dailyCalorieGoal} cal/day`}
                      </p>
                    </div>
                    <button onClick={() => deletePlan(selectedPlan.id)} className="p-1.5 text-dark-500 hover:text-red-400 rounded-lg hover:bg-dark-700/50 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedPlan.meals?.map(meal => (
                      <div key={meal.id} className="bg-dark-800/50 border border-dark-700/30 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Apple className="w-4 h-4 text-primary-400" />
                            <h4 className="text-sm font-semibold text-white">{meal.name}</h4>
                            {meal.timeOfDay && <span className="text-xs text-dark-500">{meal.timeOfDay}</span>}
                          </div>
                          <span className="text-sm font-medium text-primary-400">{meal.totalCalories || 0} cal</span>
                        </div>
                        {meal.items?.length > 0 ? (
                          <div className="space-y-1 ml-6">
                            {meal.items.map(item => (
                              <div key={item.id} className="flex items-center justify-between py-1 text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-dark-300 truncate">{item.name}</span>
                                  <span className="text-dark-500 text-xs whitespace-nowrap">({item.quantity})</span>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <span className="text-dark-400">{item.calories} cal</span>
                                  <button onClick={() => deleteItem(item.id)} className="p-0.5 text-dark-600 hover:text-red-400 transition-all">
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-dark-500 ml-6">No items</p>
                        )}
                        <button onClick={() => setShowAddItem(meal.id)} className="mt-2 ml-6 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add item
                        </button>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => setShowAddMeal(selectedPlan.id)} className="mt-4 flex items-center gap-2 px-3 py-2 text-sm text-primary-400 hover:text-primary-300 bg-primary-500/5 rounded-xl hover:bg-primary-500/10 transition-all">
                    <Plus className="w-4 h-4" /> Add Meal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-dark-800/30 border border-dark-700/30 rounded-2xl p-6 text-center">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center justify-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> Today's Calories
            </h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="54" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle cx="64" cy="64" r="54" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={2 * Math.PI * 54 * (1 - caloriePct / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-white">{totalCaloriesToday}</span>
                <span className="text-[10px] text-dark-400">of {calorieGoal}</span>
              </div>
            </div>
            <form onSubmit={logCalories} className="space-y-2">
              <input type="number" placeholder="Calories" value={calorieInput.totalCalories} onChange={(e) => setCalorieInput({ ...calorieInput, totalCalories: e.target.value })}
                className="w-full px-3 py-2 bg-dark-900/50 border border-dark-700 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              <div className="grid grid-cols-3 gap-1">
                <input type="number" placeholder="P" value={calorieInput.protein} onChange={(e) => setCalorieInput({ ...calorieInput, protein: e.target.value })} className="w-full px-2 py-1.5 bg-dark-900/50 border border-dark-700 rounded-lg text-xs text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                <input type="number" placeholder="C" value={calorieInput.carbs} onChange={(e) => setCalorieInput({ ...calorieInput, carbs: e.target.value })} className="w-full px-2 py-1.5 bg-dark-900/50 border border-dark-700 rounded-lg text-xs text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                <input type="number" placeholder="F" value={calorieInput.fat} onChange={(e) => setCalorieInput({ ...calorieInput, fat: e.target.value })} className="w-full px-2 py-1.5 bg-dark-900/50 border border-dark-700 rounded-lg text-xs text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
              <div className="flex justify-between text-[10px] text-dark-500 px-1">
                <span>Protein</span><span>Carbs</span><span>Fat</span>
              </div>
              <button type="submit" className="w-full py-2 text-xs font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg hover:from-primary-500 transition-all">Log Today</button>
            </form>
          </div>
        </div>
      </div>

      {showAIGenerate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setShowAIGenerate(false)} />
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} className="relative w-full sm:max-w-md bg-dark-800 border border-dark-700 rounded-t-3xl sm:rounded-3xl p-6">
            <button onClick={() => setShowAIGenerate(false)} className="absolute top-4 right-4 text-dark-400 hover:text-white"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Diet Plan</h2>
                <p className="text-xs text-dark-400">Generate a personalized meal plan</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Diet Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['VEGETARIAN', 'EGGETARIAN', 'NON_VEGETARIAN'].map(t => (
                    <button key={t} type="button" onClick={() => setAiForm({ ...aiForm, dietType: t })}
                      className={`px-3 py-2.5 text-xs font-medium rounded-xl border transition-all ${aiForm.dietType === t ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-dark-700 bg-dark-900/50 text-dark-400 hover:text-dark-200'}`}>
                      {t === 'VEGETARIAN' ? '🌱 Veg' : t === 'EGGETARIAN' ? '🥚 Egg' : '🍗 Non-Veg'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Daily Calorie Goal (optional)</label>
                <input type="number" value={aiForm.dailyCalorieGoal} onChange={(e) => setAiForm({ ...aiForm, dailyCalorieGoal: e.target.value })} placeholder="Auto based on your goal" className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              </div>
              <button onClick={async () => {
                setGenerating(true);
                try {
                  const plan = await dietApi.generate({ dietType: aiForm.dietType, dailyCalorieGoal: aiForm.dailyCalorieGoal ? parseInt(aiForm.dailyCalorieGoal) : undefined });
                  toast.success('AI plan generated!');
                  setShowAIGenerate(false);
                  const plansData = await dietApi.list('mine');
                  setPlans(plansData);
                  setSelectedPlanId(plan.id);
                } catch (err) { toast.error(err.message); }
                finally { setGenerating(false); }
              }} disabled={generating} className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? 'Generating...' : 'Generate Plan'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showCreatePlan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setShowCreatePlan(false)} />
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} className="relative w-full sm:max-w-md bg-dark-800 border border-dark-700 rounded-t-3xl sm:rounded-3xl p-6">
            <button onClick={() => setShowCreatePlan(false)} className="absolute top-4 right-4 text-dark-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-white mb-6">New Diet Plan</h2>
            <form onSubmit={createPlan} className="space-y-4">
              <div><label className="block text-sm font-medium text-dark-300 mb-1">Plan Name</label><input type="text" value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} placeholder="e.g. Summer Cut" className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-dark-300 mb-1">Start Date</label><input type="date" value={newPlan.startDate} onChange={(e) => setNewPlan({ ...newPlan, startDate: e.target.value })} className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" required /></div>
                <div><label className="block text-sm font-medium text-dark-300 mb-1">End Date</label><input type="date" value={newPlan.endDate} onChange={(e) => setNewPlan({ ...newPlan, endDate: e.target.value })} className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" /></div>
              </div>
              <div><label className="block text-sm font-medium text-dark-300 mb-1">Daily Calorie Goal</label><input type="number" value={newPlan.dailyCalorieGoal} onChange={(e) => setNewPlan({ ...newPlan, dailyCalorieGoal: e.target.value })} placeholder="2000" className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" /></div>
              <div><label className="block text-sm font-medium text-dark-300 mb-1">Notes</label><textarea value={newPlan.notes} onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })} rows={2} className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" /></div>
              <button type="submit" disabled={saving} className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null} {saving ? 'Creating...' : 'Create Plan'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {showAddMeal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setShowAddMeal(null)} />
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} className="relative w-full sm:max-w-sm bg-dark-800 border border-dark-700 rounded-t-3xl sm:rounded-3xl p-6">
            <button onClick={() => setShowAddMeal(null)} className="absolute top-4 right-4 text-dark-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold text-white mb-4">Add Meal</h2>
            <div className="space-y-3">
              <input type="text" value={newMeal.name} onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })} placeholder="Meal name (e.g. Breakfast)" className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              <input type="time" value={newMeal.timeOfDay} onChange={(e) => setNewMeal({ ...newMeal, timeOfDay: e.target.value })} className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              <button onClick={() => addMeal(showAddMeal)} disabled={saving} className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
                {saving ? 'Adding...' : 'Add Meal'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setShowAddItem(null)} />
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} className="relative w-full sm:max-w-sm bg-dark-800 border border-dark-700 rounded-t-3xl sm:rounded-3xl p-6">
            <button onClick={() => setShowAddItem(null)} className="absolute top-4 right-4 text-dark-400 hover:text-white"><X className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold text-white mb-4">Add Food Item</h2>
            <div className="space-y-3">
              <input type="text" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Food name" className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              <input type="text" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} placeholder="Quantity (e.g. 100g, 1 cup)" className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={newItem.calories} onChange={(e) => setNewItem({ ...newItem, calories: e.target.value })} placeholder="Calories" className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                <input type="number" value={newItem.protein} onChange={(e) => setNewItem({ ...newItem, protein: e.target.value })} placeholder="Protein (g)" className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
              <button onClick={() => addItem(showAddItem)} disabled={saving} className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
                {saving ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function DietPlanPage() {
  return <ProtectedRoute><DietPlanContent /></ProtectedRoute>;
}
