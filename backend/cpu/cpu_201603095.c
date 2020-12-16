#include <linux/module.h>
#include <linux/moduleparam.h>
#include <linux/init.h>
#include <linux/kernel.h>   
#include <linux/proc_fs.h>
#include <linux/uaccess.h>
#include <linux/fs.h>
#include <linux/utsname.h>
#include <linux/mm.h>
#include <linux/swapfile.h>
#include <linux/seq_file.h>
#include <linux/sched/task.h>
#include <linux/sched.h>
#include <linux/sysinfo.h>

#define BUFSIZE         1000

MODULE_DESCRIPTION("Creacion de modulo para obtener informacion del cpu (% de utilizacion y procesos que se ejecutan)");
MODULE_AUTHOR("Abner Fernando Cardona Ramirez");
MODULE_LICENSE("GPL");
struct task_struct* task_list;
struct task_struct *task_list_child;
struct list_head *list;

static int nproc = 0;
static int nprocexecuting = 0;
static int nprocsuspended = 0;
static int nprocstopped = 0;
static int nproczombie = 0;
static int nprocother = 0;

struct sysinfo inf;

static int escribir_procesos (struct seq_file *archivo, struct task_struct *task){
    struct task_struct *child;
    struct list_head *list;
    char state = 'O';

    nproc = nproc + 1;

    if (task->state == TASK_RUNNING)
    {
        state = 'E';
        nprocexecuting = nprocexecuting + 1;
    }
    else if (task->state == TASK_INTERRUPTIBLE)
    {
        state = 'S';
        nprocsuspended = nprocsuspended + 1;
    }
    else if (task->state == __TASK_STOPPED)
    {
        state = 'D';
        nprocstopped = nprocstopped + 1;
    }
    else if (task->exit_state == EXIT_ZOMBIE)
    {
        state = 'Z';
        nproczombie = nproczombie + 1;
    }
    else
    {
        nprocother = nprocother + 1;
    }

    seq_printf(archivo, "{");
    seq_printf(archivo, "\"pid\": %d,\"name\": \"%s\",\"state\": \"%c\",\"user\": %d,\"memory\": %ld,", task->pid, task->comm, state, task->cred->uid.val, ((task->mm ? task->mm->total_vm << (PAGE_SHIFT) : 0)/100) / (inf.totalram*4));
    seq_printf(archivo, "\"children\": [");
    list_for_each(list, &task->children) {
        child = list_entry(list, struct task_struct, sibling);
        escribir_procesos(archivo, child);
        seq_printf(archivo, ",");
    }
    seq_printf(archivo, "]");
    seq_printf(archivo, "}");
    return 0;
}

static int escribir_archivo(struct seq_file * archivo, void *v) {       
    si_meminfo(&inf);
    seq_printf(archivo, "{\"tree\":");
    
    escribir_procesos(archivo, &init_task);
    
    seq_printf(archivo, ",\"executing\":%i", nprocexecuting);
    seq_printf(archivo, ",\"suspended\":%i", nprocsuspended);
    seq_printf(archivo, ",\"stopped\":%i", nprocstopped);
    seq_printf(archivo, ",\"zombie\":%i", nproczombie);
    seq_printf(archivo, ",\"other\":%i", nprocother);
    seq_printf(archivo, ",\"total\":%i", nproc);
    
    seq_printf(archivo, ",\"totalram\": %lu", inf.totalram*4/1000);
    seq_printf(archivo, ",\"freeram\": %lu", inf.freeram*4/1000);
    seq_printf(archivo, ",\"usedram\": %lu}", 100-((inf.freeram*100)/inf.totalram));
    

    return 0;
}



static int al_abrir(struct inode *inode, struct  file *file) {
  return single_open(file, escribir_archivo, NULL);
}


static struct file_operations operaciones =
{    
    .open = al_abrir,
    .read = seq_read
};

static int inicializar(void)
{
    proc_create("cpu_201603095", 0, NULL, &operaciones);
    printk(KERN_INFO "CARNET: 201603095\n");

    return 0;
}
 
static void finalizar(void)
{
    remove_proc_entry("cpu_201603095", NULL);    
    printk(KERN_INFO "Diciembre 2020\n");
}

module_init(inicializar);
module_exit(finalizar); 