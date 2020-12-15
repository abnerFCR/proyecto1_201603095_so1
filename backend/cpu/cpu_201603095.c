#include <linux/proc_fs.h>
#include <linux/seq_file.h> 
#include <asm/uaccess.h> 
#include <linux/hugetlb.h>
#include <linux/module.h>
#include <linux/init.h>
#include <linux/kernel.h>
#include <linux/fs.h>
#include <linux/sched.h> // for_each_process, pr_info
#include <linux/sched/signal.h>  

#define BUFSIZE         1000

MODULE_DESCRIPTION("Creacion de modulo para obtener informacion del cpu (% de utilizacion y procesos que se ejecutan)");
MODULE_AUTHOR("Abner Fernando Cardona Ramirez");
MODULE_LICENSE("GPL");
struct task_struct* task_list;
struct task_struct *task_list_child;
struct list_head *list;

static int escribir_archivo(struct seq_file * archivo, void *v) {       

		seq_printf(archivo, "********************************************\n");
        seq_printf(archivo, "*  CARNET: 201603095                       *\n");
        seq_printf(archivo, "*  NOMBRE: Abner Fernando Cardona Ramirez  *\n");
        seq_printf(archivo, "********************************************\n");

        seq_printf(archivo, "PID \t NOMBRE \t ESTADO \t HIJOS \n");
        for_each_process(task_list) {
                seq_printf(archivo,"[%d] \t [%s] \t [%ld] \n", task_list->pid,task_list->comm,task_list->state);
                
                list_for_each(list, &task_list->children){         
                    task_list_child = list_entry( list, struct task_struct, sibling );             
                    seq_printf(archivo,"      [%d] \t [%s] \t [%ld] \n",task_list_child->pid, task_list_child->comm, task_list_child->state);
                }
                seq_printf(archivo, "\n");
        }
        seq_printf(archivo, "**********************************************\n");
        seq_printf(archivo, "**********************************************\n\n");

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
    printk(KERN_INFO "Curso de Sistemas Operativos 1\n");
}

module_init(inicializar);
module_exit(finalizar); 